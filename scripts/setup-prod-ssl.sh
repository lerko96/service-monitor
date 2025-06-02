#!/bin/bash

# Check if domain argument is provided
if [ -z "$1" ]; then
    echo "Usage: $0 <domain>"
    echo "Example: $0 example.com"
    exit 1
fi

DOMAIN=$1

# Ensure we're in the project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/.."

# Check if certbot is installed
if ! command -v certbot &> /dev/null; then
    echo "Installing certbot..."
    sudo apt-get update
    sudo apt-get install -y certbot
fi

# Stop nginx if it's running (needed for certbot)
if docker compose ps | grep -q nginx; then
    echo "Stopping nginx temporarily..."
    docker compose stop nginx
fi

# Get the certificate
echo "Obtaining SSL certificate for $DOMAIN..."
sudo certbot certonly --standalone -d "$DOMAIN"

# Create ssl directory if it doesn't exist
sudo mkdir -p ssl

# Copy certificates
echo "Copying certificates..."
sudo cp "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ssl/cert.pem
sudo cp "/etc/letsencrypt/live/$DOMAIN/privkey.pem" ssl/key.pem

# Set permissions
sudo chown -R $USER:$USER ssl/
chmod 600 ssl/*.pem

# Set up auto-renewal in crontab if not already set
if ! (crontab -l 2>/dev/null | grep -q "certbot renew"); then
    echo "Setting up automatic renewal..."
    (crontab -l 2>/dev/null; echo "0 0 1 * * certbot renew --quiet && docker compose restart nginx") | crontab -
fi

# Restart nginx
echo "Restarting nginx..."
docker compose start nginx

echo "✅ SSL certificates installed successfully!"
echo "📝 Certificate location: ssl/cert.pem and ssl/key.pem"
echo "🔄 Auto-renewal has been configured (monthly)"
echo "⚠️  Remember to keep your certificates and private keys secure!" 
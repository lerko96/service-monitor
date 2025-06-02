#!/bin/bash

# Ensure we're in the project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/.."

# Create ssl directory if it doesn't exist
mkdir -p ssl

# Generate self-signed certificates for development
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout ssl/key.pem -out ssl/cert.pem \
  -subj "/CN=localhost" \
  -addext "subjectAltName=DNS:localhost,IP:127.0.0.1"

# Set correct permissions
chmod 600 ssl/*.pem

echo "✅ Development SSL certificates generated successfully!"
echo "⚠️  Note: These certificates are for development only."
echo "   You will see browser warnings - this is normal for self-signed certificates." 
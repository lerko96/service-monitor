# SSL Certificates Setup

This directory is where your SSL certificates should be placed. For security reasons, actual certificates are not included in the repository.

## Quick Start

### Development
Run the automated setup script:
```bash
./scripts/setup-dev-ssl.sh
```
This will generate self-signed certificates for development.

### Production
1. Using Let's Encrypt (Recommended):
   ```bash
   ./scripts/setup-prod-ssl.sh your-domain.com
   ```
   This will automatically obtain and configure Let's Encrypt certificates.

2. Using Your Own Certificates:
   - Place your certificate at `ssl/cert.pem`
   - Place your private key at `ssl/key.pem`

## Directory Structure
```
ssl/
├── cert.pem        # Your SSL certificate (not in repo)
├── key.pem         # Your private key (not in repo)
├── example/        # Example configurations
│   └── nginx.conf  # Example nginx SSL configuration
└── README.md       # This file
```

## Security Notes
- Never commit actual certificates or private keys
- Development certificates are for local use only
- In production, always use certificates from a trusted CA
- Monitor certificate expiration dates 
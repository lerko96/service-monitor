# Service Monitor

A web application that monitors the status of web services and provides real-time updates on their availability.

## Features

- User authentication with JWT tokens
- Add, manage, and monitor web services
- Automatic service status checks (30s in development, 5min in production)
- Real-time dashboard with service status updates
- Toast notifications for user actions and service status changes
- Professional UI with React and modern styling
- Comprehensive error handling and boundary protection
- HTTPS support with nginx reverse proxy
- Docker-ready for production deployment
- Health check endpoints for monitoring
- SQLite database with persistent storage
- Graceful shutdown handling

## Prerequisites

- Node.js >= 18.0.0
- npm or yarn
- SQLite3
- Docker and Docker Compose (for production)

## Tech Stack

### Backend
- Express.js
- SQLite3 with sqlite3 driver
- JSON Web Tokens (JWT) for authentication
- node-cron for scheduled tasks
- Morgan for request logging

### Frontend
- React 18 with Vite
- React Router for navigation
- Axios for API requests
- date-fns for date formatting
- Modern CSS with responsive design
- Toast notifications system
- Error Boundary implementation

## Local Development

1. Clone the repository:
   ```bash
   git clone https://github.com/lerko96/service-monitor.git
   cd service-monitor
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:3001`

## Production Deployment (Docker)

1. Build and run with Docker Compose:
   ```bash
   # Using Docker Compose V2
   docker compose up -d --build
   ```

2. Environment Variables:
   - Copy `.env.example` to `.env`
   - Update the variables as needed
   - Ensure `JWT_SECRET` is set to a secure value

3. Access the Application:
   - The application will be available at `https://your-domain`
   - HTTPS is configured through the included nginx reverse proxy
   - HTTP traffic (port 80) is automatically redirected to HTTPS (port 443)
   - Default admin credentials:
     - Username: `admin`
     - Password: `admin123`
     - **Important**: Change these credentials after first login in production

4. Monitor and Manage:
   - Check container logs: `docker compose logs -f`
   - Visit the health check endpoint at `/api/health`
   - Monitor service status in the dashboard
   - To stop containers: `docker compose down`
   - To stop and reset database: `docker compose down -v`

## Database

The application uses SQLite3 for data storage:
- Development: File stored at `./database/service-monitor.db`
- Production: Stored in a Docker volume at `/app/data/service-monitor.db`
- Automatic schema initialization on first run
- Default admin user created on fresh database
- Data persists between container restarts (unless `-v` flag used with down command)
- Includes tables for users, services, and service checks

## Environment Variables

Required variables:
- `PORT`: Server port (default: 3001)
- `NODE_ENV`: Environment (development/production)
- `JWT_SECRET`: Secret for JWT tokens
- `JWT_EXPIRATION`: Token expiration time (default: 24h)
- `DB_PATH`: SQLite database file path
- `CHECK_INTERVAL`: Service check interval in minutes (defaults: 0.5 dev, 5 prod)
- `REQUEST_TIMEOUT`: Service check timeout in milliseconds (default: 5000)
- `LOG_LEVEL`: Logging level (info/error/debug)

## Health Checks

The application provides a health check endpoint at `/api/health` that returns:
- Server status
- Database connection status
- Application version
- Current timestamp

Health checks are configured in both the application and Docker containers.

## Error Handling

- Frontend:
  - React Error Boundary for component error catching
  - Toast notifications for user feedback
  - Form validation with error messages
  - Network error handling
  
- Backend:
  - Global error handler for API errors
  - Request validation
  - Database error handling
  - Graceful shutdown handling

## Security

### Initial Setup
1. Generate a Strong JWT Secret:
   ```bash
   # Option 1: Using OpenSSL (recommended for production)
   openssl rand -base64 64

   # Option 2: Using Node.js
   node -e "console.log(require('crypto').randomBytes(64).toString('base64'));"
   ```
   Add this to your `.env` file as `JWT_SECRET`

2. SSL/HTTPS Configuration:
   
   The application requires SSL certificates for HTTPS. These are not included in the repository for security reasons.
   
   #### Development Setup
   1. Create the SSL directory:
      ```bash
      mkdir -p ssl
      ```
   
   2. Generate self-signed certificates:
      ```bash
      openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout ssl/key.pem -out ssl/cert.pem \
        -subj "/CN=localhost"
      ```
      Note: Self-signed certificates will show security warnings in browsers (this is normal for development)
   
   #### Production Setup
   For production, you should obtain certificates from a trusted Certificate Authority. We recommend Let's Encrypt:
   
   1. Install Certbot:
      ```bash
      sudo apt-get update
      sudo apt-get install certbot
      ```
   
   2. Obtain certificates (replace example.com with your domain):
      ```bash
      sudo certbot certonly --standalone -d example.com
      ```
   
   3. Copy certificates to the ssl directory:
      ```bash
      sudo mkdir -p ssl
      sudo cp /etc/letsencrypt/live/example.com/fullchain.pem ssl/cert.pem
      sudo cp /etc/letsencrypt/live/example.com/privkey.pem ssl/key.pem
      ```
   
   4. Set proper permissions:
      ```bash
      sudo chown -R $USER:$USER ssl/
      chmod 600 ssl/*.pem
      ```
   
   5. Set up automatic renewal:
      ```bash
      sudo certbot renew --dry-run
      ```
      Add to crontab:
      ```bash
      sudo crontab -e
      # Add this line:
      0 0 1 * * certbot renew --quiet && docker compose restart nginx
      ```

   Important: 
   - Never commit SSL certificates to version control
   - Keep backups of your certificates in a secure location
   - Monitor certificate expiration dates
   - For high-availability production environments, consider using a managed SSL service

3. Default Admin Account:
   - The default credentials (admin/admin123) are created on first run
   - **IMPORTANT**: Change these immediately after first login in production
   - Create a new admin user and delete or disable the default account

### Best Practices
1. Environment Variables:
   - Never commit `.env` files to version control
   - Keep different `.env` files for development and production
   - Regularly rotate secrets and credentials
   - Use strong, unique values for all secrets

2. Database Security:
   - The SQLite database is stored in a Docker volume
   - Backup the database regularly
   - Consider file system permissions in production
   - Monitor database access logs

3. Production Deployment:
   - Use a firewall and restrict port access
   - Keep Docker and all dependencies updated
   - Monitor system logs for suspicious activity
   - Regularly update SSL certificates before expiration
   - Consider rate limiting for API endpoints
   - Use secure headers (already configured in nginx)

### Security Headers
The application includes several security headers by default:
- Strict-Transport-Security (HSTS)
- X-Frame-Options
- X-XSS-Protection
- X-Content-Type-Options
- Content-Security-Policy
- Referrer-Policy

## API Endpoints

### Health Check
- `GET /api/health` - Check system status

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and get JWT token

### Services
- `GET /api/services` - List all services
- `POST /api/services` - Add a new service
- `DELETE /api/services/:id` - Delete a service

## Project Structure

```
service-monitor/
├── database/          # Database related files
├── jobs/             # Scheduled jobs and tasks
│   ├── scheduler.js  # Service check scheduler
│   └── serviceChecker.js # Service check logic
├── middleware/       # Express middleware
│   └── auth.js      # JWT authentication
├── routes/          # API routes
│   ├── auth.js      # Authentication routes
│   └── services.js  # Service management routes
├── frontend/        # React frontend application
├── server.js        # Main application file
├── docker-compose.yml # Docker Compose configuration
├── Dockerfile       # Docker build configuration
├── nginx.conf       # Nginx reverse proxy configuration
├── .env             # Environment variables
└── package.json     # Project dependencies and scripts
``` 

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License - see LICENSE file for details 
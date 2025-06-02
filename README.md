# Service Monitor

A web application that monitors the status of web services and provides real-time updates on their availability.

## Features

- User authentication and authorization
- Add and manage services to monitor
- Automatic service status checks every 5 minutes
- Real-time dashboard with service status
- Toast notifications for user actions
- Professional UI with error handling

## Prerequisites

- Node.js >= 18.0.0
- npm or yarn
- SQLite3
- Docker (for production deployment)

## Local Development

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/service-monitor.git
   cd service-monitor
   ```

2. Install dependencies:
   ```bash
   npm install
   cd frontend && npm install && cd ..
   ```

3. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```

4. Start the development server:
   ```bash
   # Terminal 1: Backend
   npm run dev

   # Terminal 2: Frontend
   cd frontend && npm run dev
   ```

## Production Deployment (Docker)

1. Build and run with Docker Compose:
   ```bash
   docker-compose up -d --build
   ```

2. Environment Variables:
   - Copy `.env.example` to `.env`
   - Update the variables as needed
   - Ensure `JWT_SECRET` is set to a secure value

3. Access the Application:
   - The application will be available at `http://localhost:3001`
   - For HTTPS, configure your reverse proxy (nginx configuration included)

4. Monitor:
   - Check container logs: `docker-compose logs -f`
   - Visit the health check endpoint at `/api/health`
   - Monitor service status in the dashboard

## Database

The application uses SQLite3 for data storage. In production:
- The database file is stored in a Docker volume
- Located at the path specified in `DB_PATH`
- Data persists between container restarts

## Environment Variables

Required variables:
- `PORT`: Server port (default: 3001)
- `NODE_ENV`: Environment (development/production)
- `JWT_SECRET`: Secret for JWT tokens
- `JWT_EXPIRATION`: Token expiration time
- `DB_PATH`: SQLite database file path
- `CHECK_INTERVAL`: Service check interval in minutes
- `REQUEST_TIMEOUT`: Service check timeout in milliseconds

## Health Checks

The application provides a health check endpoint at `/api/health` that returns:
- Server status
- Database connection status
- Application version
- Current timestamp

## Error Handling

- Frontend: React Error Boundary catches rendering errors
- Backend: Global error handler for API errors
- Toast notifications for user feedback
- Graceful shutdown handling

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License - see LICENSE file for details

## API Endpoints

### Health Check
- `GET /api/health` - Check if the server is running

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
├── database/     # Database related files
├── jobs/         # Scheduled jobs and tasks
├── middleware/   # Express middleware
├── routes/       # API routes
├── frontend/     # React frontend application
├── server.js     # Main application file
├── docker-compose.yml  # Docker Compose configuration
├── Dockerfile    # Docker build configuration
├── nginx.conf    # Nginx reverse proxy configuration
├── .env          # Environment variables (create from .env.example)
└── package.json  # Project dependencies and scripts
``` 
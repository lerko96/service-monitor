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

## Production Deployment (Railway)

1. Create a new project on Railway:
   - Connect your GitHub repository
   - Railway will automatically detect the configuration

2. Set up environment variables in Railway:
   - Go to your project settings
   - Add all variables from `.env.example`
   - Update `VITE_API_URL` with your Railway app URL
   - Generate a secure `JWT_SECRET`

3. Deploy:
   - Railway will automatically build and deploy your application
   - The build process will:
     1. Install dependencies
     2. Build the frontend
     3. Start the server

4. Monitor:
   - Check the deployment logs
   - Visit the health check endpoint at `/api/health`
   - Monitor service status in the dashboard

## Database

The application uses SQLite3 for data storage. In production:
- The database file is created automatically
- Located at the path specified in `DB_PATH`
- Ensure the directory is writable

## Environment Variables

Required variables:
- `PORT`: Server port (default: 3001)
- `NODE_ENV`: Environment (development/production)
- `JWT_SECRET`: Secret for JWT tokens
- `JWT_EXPIRATION`: Token expiration time
- `DB_PATH`: SQLite database file path
- `VITE_API_URL`: Backend API URL for frontend

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

More endpoints will be added as development progresses.

## Project Structure

```
service-monitor/
├── database/     # Database related files
├── jobs/         # Scheduled jobs and tasks
├── middleware/   # Express middleware
├── routes/       # API routes
├── server.js     # Main application file
├── .env          # Environment variables (create from .env.example)
└── package.json  # Project dependencies and scripts
``` 
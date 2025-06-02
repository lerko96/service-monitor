# Build stage
FROM node:18-alpine as builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY frontend/package*.json ./frontend/

# Install dependencies and build frontend
RUN npm install
RUN cd frontend && npm install
COPY . .
RUN cd frontend && npm run build

# Production stage
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files and install production dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Copy built frontend and backend files
COPY --from=builder /app/frontend/dist ./frontend/dist
COPY server.js .
COPY routes ./routes
COPY middleware ./middleware
COPY jobs ./jobs
COPY database ./database

# Create volume mount point for database
RUN mkdir -p /app/data
VOLUME /app/data

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3001
ENV DB_PATH=/app/data/service-monitor.db

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3001/api/health || exit 1

# Start the application
CMD ["node", "server.js"] 
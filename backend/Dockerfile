# Backend with Docker CLI only (no Docker daemon)

FROM node:18-alpine

# Install Docker CLI and build dependencies for node-pty
RUN apk add --no-cache docker-cli python3 make g++

WORKDIR /app

# Copy package files from backend directory
COPY backend/package*.json ./

# Install dependencies
RUN npm install

# Copy source code from backend directory
COPY backend/ .

# Expose port
EXPOSE 3001

# Simple start command (no Docker daemon management)
CMD ["npm", "start"]

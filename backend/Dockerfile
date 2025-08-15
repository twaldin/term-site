FROM docker:24-dind

# Install Node.js and dependencies
RUN apk add --no-cache nodejs npm python3 make g++

WORKDIR /app

# Copy package files from backend directory
COPY backend/package*.json ./

# Install dependencies
RUN npm install

# Copy source code from backend directory
COPY backend/ .

# Expose port
EXPOSE 3000

# Start Docker daemon in background and then start the server
CMD dockerd-entrypoint.sh & sleep 5 && npm start
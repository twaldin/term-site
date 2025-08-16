# Backend with embedded terminal container
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

# Copy dotfiles and container setup
COPY dotfiles ./dotfiles
COPY container/Dockerfile ./terminal.Dockerfile

# Create terminal image build script
RUN echo '#!/bin/sh' > /app/build-terminal-image.sh && \
    echo 'set -e' >> /app/build-terminal-image.sh && \
    echo 'echo "Building terminal-portfolio image..."' >> /app/build-terminal-image.sh && \
    echo 'if docker build -f /app/terminal.Dockerfile -t terminal-portfolio:latest /app; then' >> /app/build-terminal-image.sh && \
    echo '  echo "Terminal image built successfully"' >> /app/build-terminal-image.sh && \
    echo '  docker images terminal-portfolio:latest' >> /app/build-terminal-image.sh && \
    echo 'else' >> /app/build-terminal-image.sh && \
    echo '  echo "ERROR: Failed to build terminal image"' >> /app/build-terminal-image.sh && \
    echo '  exit 1' >> /app/build-terminal-image.sh && \
    echo 'fi' >> /app/build-terminal-image.sh && \
    chmod +x /app/build-terminal-image.sh

# Expose port
EXPOSE 3001

# Create startup script that handles failures gracefully
RUN echo '#!/bin/sh' > /app/startup.sh && \
    echo 'set -e' >> /app/startup.sh && \
    echo 'echo "Starting Docker daemon..."' >> /app/startup.sh && \
    echo 'dockerd-entrypoint.sh &' >> /app/startup.sh && \
    echo 'echo "Waiting for Docker daemon to be ready..."' >> /app/startup.sh && \
    echo 'timeout=30' >> /app/startup.sh && \
    echo 'while [ $timeout -gt 0 ] && ! docker version > /dev/null 2>&1; do' >> /app/startup.sh && \
    echo '  sleep 1' >> /app/startup.sh && \
    echo '  timeout=$((timeout - 1))' >> /app/startup.sh && \
    echo 'done' >> /app/startup.sh && \
    echo 'if [ $timeout -eq 0 ]; then' >> /app/startup.sh && \
    echo '  echo "ERROR: Docker daemon failed to start within 30 seconds"' >> /app/startup.sh && \
    echo '  echo "Starting server without terminal image build..."' >> /app/startup.sh && \
    echo '  exec npm start' >> /app/startup.sh && \
    echo 'fi' >> /app/startup.sh && \
    echo 'echo "Docker daemon is ready"' >> /app/startup.sh && \
    echo 'echo "Building terminal image..."' >> /app/startup.sh && \
    echo 'if /app/build-terminal-image.sh; then' >> /app/startup.sh && \
    echo '  echo "Terminal image built successfully"' >> /app/startup.sh && \
    echo 'else' >> /app/startup.sh && \
    echo '  echo "WARNING: Terminal image build failed, continuing anyway"' >> /app/startup.sh && \
    echo 'fi' >> /app/startup.sh && \
    echo 'echo "Starting Node.js server..."' >> /app/startup.sh && \
    echo 'exec npm start' >> /app/startup.sh && \
    chmod +x /app/startup.sh

# Start with the startup script
CMD ["/app/startup.sh"]
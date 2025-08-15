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
    echo 'echo "Building terminal-portfolio image..."' >> /app/build-terminal-image.sh && \
    echo 'docker build -f /app/terminal.Dockerfile -t terminal-portfolio:latest /app' >> /app/build-terminal-image.sh && \
    echo 'echo "Terminal image built successfully"' >> /app/build-terminal-image.sh && \
    echo 'docker images terminal-portfolio:latest' >> /app/build-terminal-image.sh && \
    chmod +x /app/build-terminal-image.sh

# Expose port
EXPOSE 3001

# Start Docker daemon, build terminal image, and start the server
CMD dockerd-entrypoint.sh & sleep 10 && /app/build-terminal-image.sh && npm start
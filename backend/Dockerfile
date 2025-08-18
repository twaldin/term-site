# Backend with embedded terminal container
FROM docker:24-dind

# Install Node.js and dependencies
RUN apk add --no-cache nodejs npm python3 make g++

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code  
COPY . .

# Expose port
EXPOSE 3001

# Create startup script that starts Docker daemon and Node.js server
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
    echo '  echo "Starting server without Docker support..."' >> /app/startup.sh && \
    echo '  exec npm start' >> /app/startup.sh && \
    echo 'fi' >> /app/startup.sh && \
    echo 'echo "Docker daemon is ready"' >> /app/startup.sh && \
    echo 'echo "Starting Node.js server..."' >> /app/startup.sh && \
    echo 'exec npm start' >> /app/startup.sh && \
    chmod +x /app/startup.sh

# Start with the startup script
CMD ["/app/startup.sh"]
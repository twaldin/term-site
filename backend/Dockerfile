FROM node:18-alpine

# Install build dependencies for node-pty
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Expose port (Cloud Run uses PORT env var)
EXPOSE 3000

# Add non-root user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001
USER nodejs

# Start the server
CMD ["npm", "start"]
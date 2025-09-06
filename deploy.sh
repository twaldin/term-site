#!/bin/bash
set -e  # Exit on any error

echo "Starting deployment..."

# Stop all containers
echo "Stopping existing containers..."
docker-compose down

# Remove the docker-daemon volumes to force a complete rebuild
echo "Cleaning docker-daemon volumes to force terminal image rebuild..."
docker volume rm term-site_docker-data 2>/dev/null || true

# Fix SELinux contexts for nginx configuration
if command -v selinuxenabled >/dev/null 2>&1 && selinuxenabled; then
    echo "Fixing SELinux contexts for nginx.conf..."
    chcon -t container_file_t nginx.conf 2>/dev/null || true
fi

# Build and start all services with no-cache to ensure everything is fresh
echo "Building and starting services (this will rebuild terminal image inside docker-daemon)..."
docker-compose build --no-cache docker-daemon
docker-compose up -d --build --force-recreate

# Wait for Docker daemon to be ready
echo "Waiting for services to initialize..."
sleep 10

# Check if all required services are running
echo "Checking service health..."
REQUIRED_SERVICES=("term-frontend" "term-backend" "term-nginx" "term-tunnel" "term-docker-daemon")
ALL_RUNNING=true

for service in "${REQUIRED_SERVICES[@]}"; do
    if ! docker ps --format "table {{.Names}}" | grep -q "^${service}$"; then
        echo "Service ${service} is not running!"
        ALL_RUNNING=false
    else
        echo "Service ${service} is running"
    fi
done

if [ "$ALL_RUNNING" = false ]; then
    echo "Some services failed to start. Attempting to restart them..."
    docker-compose up -d
    sleep 10
fi

# Terminal image is now built automatically as part of docker-daemon startup
echo "Terminal container image built during docker-daemon initialization"

echo "Deployment complete. Container status:"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# Final health check
echo ""
echo "Testing site connectivity..."
if curl -s -o /dev/null -w "%{http_code}" http://localhost/ | grep -q "200\|302"; then
    echo "Site is responding correctly"
else
    echo "Site may not be fully ready yet. Check logs if issues persist."
fi

#!/bin/bash

echo "Checking terminal image status inside docker-daemon container..."

# Check if docker-daemon is running
if ! docker ps | grep -q term-docker-daemon; then
    echo "ERROR: term-docker-daemon is not running"
    exit 1
fi

# Check images inside the docker-daemon
echo ""
echo "Images inside docker-daemon:"
docker exec term-docker-daemon docker images | grep -E "REPOSITORY|terminal-portfolio" || echo "No terminal-portfolio image found"

echo ""
echo "Docker daemon logs (last 20 lines):"
docker logs term-docker-daemon 2>&1 | tail -20

echo ""
echo "Checking if backend can see the image:"
docker exec term-backend sh -c 'curl -s http://docker-daemon:2375/images/json | grep -o "terminal-portfolio" | head -1' || echo "Backend cannot access image"

echo ""
echo "To manually rebuild the terminal image inside docker-daemon:"
echo "  docker exec term-docker-daemon docker build --no-cache -t twaldin/terminal-portfolio:latest /terminal-container"

echo ""
echo "To test creating a container:"
echo "  docker exec term-docker-daemon docker run --rm twaldin/terminal-portfolio:latest echo 'Terminal container works!'"
#!/bin/bash

# Build script for terminal portfolio container

echo "Building terminal portfolio container..."

cd "$(dirname "$0")/.."

docker build -t twaldin/terminal-portfolio:latest ./container

if [ $? -eq 0 ]; then
    echo "Container built successfully!"
    echo "Image: twaldin/terminal-portfolio:latest"
    docker images twaldin/terminal-portfolio:latest
    echo ""
    echo "To test the container locally:"
    echo "docker run -it --rm twaldin/terminal-portfolio:latest"
else
    echo "Container build failed!"
    exit 1
fi

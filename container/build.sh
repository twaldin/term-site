#!/bin/bash

# Build script for terminal portfolio container

echo "Building terminal portfolio container..."

# Ensure we're in the right directory (term-site root)
cd "$(dirname "$0")/.."

# No submodules needed - all repositories are cloned directly in Docker

# Build the Docker image from the root directory
docker build -f container/Dockerfile -t terminal-portfolio:latest .

if [ $? -eq 0 ]; then
    echo "Container built successfully!"
    echo "Image: terminal-portfolio:latest"
    
    # Show image info
    docker images terminal-portfolio:latest
    
    echo ""
    echo "To test the container locally:"
    echo "docker run -it --rm terminal-portfolio:latest"
    
else
    echo "Container build failed!"
    exit 1
fi
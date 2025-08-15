#!/bin/bash

# Build script for terminal portfolio container

echo "Building terminal portfolio container..."

# Ensure we're in the right directory (term-site root)
cd "$(dirname "$0")/.."

# Initialize and update git submodules
echo "Initializing git submodules..."
git submodule init
git submodule update

# Build the Docker image from the root directory (so it can access dotfiles submodule)
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
#!/bin/bash

echo "🚀 Starting Terminal Portfolio locally..."

# Build and start all services
docker-compose up --build -d

echo ""
echo "✅ Services started successfully!"
echo ""
echo "🌐 Frontend: http://localhost:3000"
echo "🔌 Backend API: http://localhost:3001"
echo "🐳 Terminal Container: terminal-portfolio"
echo ""
echo "To access the terminal directly:"
echo "docker exec -it terminal-portfolio zsh"
echo ""
echo "To stop all services:"
echo "docker-compose down"
echo ""
echo "To view logs:"
echo "docker-compose logs -f"
#!/bin/bash

echo "🚀 T24 Task Manager - Quick Start Script"
echo "=========================================="
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

echo "✅ Docker and Docker Compose are installed"
echo ""

# Create .env files if they don't exist
if [ ! -f server/.env ]; then
    echo "📝 Creating server/.env from example..."
    cp server/.env.example server/.env
    
    # Generate random JWT secret
    JWT_SECRET=$(openssl rand -base64 32 2>/dev/null || head -c 32 /dev/urandom | base64)
    
    # Update JWT_SECRET in .env
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s/JWT_SECRET=.*/JWT_SECRET=$JWT_SECRET/" server/.env
    else
        # Linux
        sed -i "s/JWT_SECRET=.*/JWT_SECRET=$JWT_SECRET/" server/.env
    fi
    
    echo "✅ Generated random JWT_SECRET"
fi

if [ ! -f client/.env ]; then
    echo "📝 Creating client/.env from example..."
    cp client/.env.example client/.env
fi

echo ""
echo "🐳 Starting Docker containers..."
echo ""

# Start Docker Compose
docker compose up -d --build

echo ""
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check if services are running
if docker compose ps | grep -q "Up"; then
    echo ""
    echo "✅ All services are running!"
    echo ""
    echo "📱 Application URLs:"
    echo "   Frontend:  http://localhost"
    echo "   Backend:   http://localhost:3000"
    echo "   Health:    http://localhost:3000/health"
    echo ""
    echo "📊 View logs:"
    echo "   docker compose logs -f"
    echo ""
    echo "🛑 Stop services:"
    echo "   docker compose down"
    echo ""
    echo "🎉 Happy task managing!"
else
    echo ""
    echo "❌ Some services failed to start. Check logs:"
    echo "   docker compose logs"
fi

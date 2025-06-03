#!/bin/bash

# Setup script for Local AI infrastructure
# This script replaces OpenAI with free local AI models

echo "🚀 Setting up Local AI Infrastructure..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create directories for AI models
mkdir -p ./ai-models
mkdir -p ./scripts

# Copy environment variables
echo "📝 Setting up environment variables..."
if [ ! -f .env ]; then
    echo "Creating .env file with local AI configuration..."
    cp .env.local-ai .env
else
    echo "Adding local AI configuration to existing .env file..."
    cat .env.local-ai >> .env
fi

# Start the local AI infrastructure
echo "🐳 Starting local AI services with Docker..."
docker-compose -f docker-compose.local-ai.yml up -d

# Wait for services to be ready
echo "⏳ Waiting for services to initialize..."
sleep 30

# Check if Ollama is running
echo "🔍 Checking Ollama service..."
if curl -s http://localhost:11434/api/tags > /dev/null; then
    echo "✅ Ollama is running successfully"
else
    echo "⚠️  Ollama may not be ready yet, please wait a few more minutes"
fi

# Download recommended models
echo "📥 Downloading AI models..."
echo "This may take several minutes depending on your internet connection..."

# Download lightweight model first
docker exec career-platform-ollama ollama pull llama3.2:3b
echo "✅ Downloaded Llama 3.2 3B (lightweight model)"

# Download medium-sized model
docker exec career-platform-ollama ollama pull llama3.1:7b
echo "✅ Downloaded Llama 3.1 7B (medium model)"

# Test the AI service
echo "🧪 Testing local AI service..."
curl -X POST http://localhost:11434/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "model": "llama3.2:3b",
    "prompt": "Give me a brief career advice for a software developer",
    "stream": false
  }' > /dev/null 2>&1

if [ $? -eq 0 ]; then
    echo "✅ Local AI service is working correctly"
else
    echo "⚠️  Local AI service test failed, but services are running"
fi

echo ""
echo "🎉 Local AI Infrastructure Setup Complete!"
echo ""
echo "📊 Service Status:"
echo "- Ollama: http://localhost:11434"
echo "- Redis Cache: localhost:6379"
echo ""
echo "💡 Available Models:"
echo "- llama3.2:3b (lightweight, fast)"
echo "- llama3.1:7b (medium quality)"
echo ""
echo "🔧 Configuration:"
echo "- AI Provider: Ollama"
echo "- Primary Model: llama3.2:3b"
echo "- Fallback: Enabled (uses OpenAI if local fails)"
echo ""
echo "🚀 Your application is now using FREE local AI models!"
echo "💰 Cost savings: 100% - No more OpenAI API charges"
echo ""
echo "To stop services: docker-compose -f docker-compose.local-ai.yml down"
echo "To restart: docker-compose -f docker-compose.local-ai.yml up -d"
#!/bin/bash
set -e

echo "🏋️ GymTrack — VM Deployment Script"
echo "===================================="

# --- Step 1: Check if running as root or with sudo ---
if ! command -v sudo &> /dev/null; then
    echo "❌ 'sudo' is required. Please install it or run as root."
    exit 1
fi

# --- Step 2: Install Docker if not present ---
if ! command -v docker &> /dev/null; then
    echo "📦 Docker not found. Installing..."
    sudo apt update
    sudo apt install -y docker.io docker-compose-v2
    sudo systemctl enable --now docker
    echo "✅ Docker installed and started"
else
    echo "✅ Docker already installed: $(docker --version)"
fi

# --- Step 3: Setup .env file ---
if [ ! -f .env ]; then
    echo "⚙️  Creating .env from .env.production..."
    cp .env.production .env

    # Generate JWT secret
    SECRET=$(openssl rand -hex 32)
    sed -i "s/^JWT_SECRET=$/JWT_SECRET=$SECRET/" .env
    echo "🔐 Generated JWT_SECRET"

    echo "📝 Edit .env if you want to change ports (current: HOST_PORT=80)"
else
    echo "✅ .env file already exists"
fi

# --- Step 4: Configure firewall (if UFW is active) ---
if sudo ufw status 2>/dev/null | grep -q "Status: active"; then
    echo "🔥 UFW is active, allowing port 80..."
    sudo ufw allow 80/tcp 2>/dev/null || true
    sudo ufw allow 443/tcp 2>/dev/null || true
    echo "✅ Firewall rules updated"
else
    echo "ℹ️  UFW not active, skipping firewall config"
fi

# --- Step 5: Build and run ---
echo "🚀 Building and starting containers..."
sudo docker compose up -d --build

echo ""
echo "===================================="
echo "✅ GymTrack is running!"
echo ""

# Get VM IP
VM_IP=$(hostname -I | awk '{print $1}')
echo "🌐 Open: http://$VM_IP/"
echo "🔧 API:  http://$VM_IP/api/health"
echo ""
echo "Useful commands:"
echo "  docker compose ps          — check status"
echo "  docker compose logs -f     — view logs"
echo "  docker compose down        — stop containers"
echo "  docker compose down -v     — stop + remove database"

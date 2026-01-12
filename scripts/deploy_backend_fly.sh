#!/bin/bash
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  TitanTrack Backend Deployment${NC}"
echo -e "${BLUE}  Target: Fly.io${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check if flyctl is installed
if ! command -v fly &> /dev/null; then
    echo -e "${RED}Error: flyctl is not installed${NC}"
    echo ""
    echo "Install flyctl:"
    echo "  macOS:   brew install flyctl"
    echo "  Linux:   curl -L https://fly.io/install.sh | sh"
    echo "  Windows: powershell -Command \"iwr https://fly.io/install.ps1 -useb | iex\""
    echo ""
    echo "Then login: fly auth login"
    exit 1
fi

# Get script directory and project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
BACKEND_DIR="$PROJECT_ROOT/backend"

# Check if fly.toml exists
if [ ! -f "$BACKEND_DIR/fly.toml" ]; then
    echo -e "${RED}Error: backend/fly.toml not found${NC}"
    echo "Run 'fly launch' in the backend directory first"
    exit 1
fi

# Print prerequisites
echo -e "${YELLOW}Prerequisites:${NC}"
echo "  Ensure these secrets are set in Fly.io:"
echo ""
echo "  Required:"
echo "    DATABASE_URL   = PostgreSQL connection string"
echo "    JWT_SECRET     = Secret key for JWT signing (min 32 chars)"
echo "    CORS_ORIGINS   = JSON array of allowed origins"
echo ""
echo "  Set secrets with:"
echo "    fly secrets set DATABASE_URL=\"postgresql://...\" \\"
echo "      JWT_SECRET=\"your-secret-key-32-chars-minimum\" \\"
echo "      CORS_ORIGINS='[\"https://titan-track.vercel.app\"]'"
echo ""
echo -e "${BLUE}----------------------------------------${NC}"

# Change to backend directory
cd "$BACKEND_DIR"

# Deploy to Fly.io
echo -e "${BLUE}Deploying to Fly.io...${NC}"
fly deploy

# Show status
echo ""
echo -e "${BLUE}Checking deployment status...${NC}"
fly status

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Deployment Complete!${NC}"
echo -e "${GREEN}  URL: https://titan-track-api.fly.dev${NC}"
echo -e "${GREEN}========================================${NC}"

#!/bin/bash
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  TitanTrack Frontend Deployment${NC}"
echo -e "${BLUE}  Target: Vercel${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check if bun is installed
if ! command -v bun &> /dev/null; then
    echo -e "${RED}Error: bun is not installed${NC}"
    echo "Install bun: curl -fsSL https://bun.sh/install | bash"
    exit 1
fi

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo -e "${YELLOW}Warning: vercel CLI is not installed${NC}"
    echo "Installing vercel CLI..."
    bun add -g vercel
fi

# Print prerequisites
echo -e "${YELLOW}Prerequisites:${NC}"
echo "  Ensure these environment variables are set in Vercel Dashboard:"
echo ""
echo "  Required:"
echo "    VITE_API_URL = https://titan-track-api.fly.dev"
echo ""
echo -e "${BLUE}----------------------------------------${NC}"

# Get script directory and project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Change to project root
cd "$PROJECT_ROOT"

# Install dependencies
echo -e "${BLUE}Installing dependencies...${NC}"
bun install

# Build the project
echo -e "${BLUE}Building project...${NC}"
bun run build

# Deploy to Vercel
echo -e "${BLUE}Deploying to Vercel...${NC}"
vercel --prod --yes

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Deployment Complete!${NC}"
echo -e "${GREEN}========================================${NC}"

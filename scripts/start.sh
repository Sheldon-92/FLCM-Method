#!/bin/bash

# FLCM Startup Script
# Handles application startup with health checks and logging

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LOG_DIR="${APP_DIR}/logs"
PID_FILE="${APP_DIR}/.flcm.pid"
ENV_FILE="${APP_DIR}/.env"

# Create necessary directories
mkdir -p "${LOG_DIR}"
mkdir -p "${APP_DIR}/data/cache"
mkdir -p "${APP_DIR}/data/analytics"
mkdir -p "${APP_DIR}/data/users"

# Load environment variables
if [ -f "${ENV_FILE}" ]; then
    export $(cat "${ENV_FILE}" | grep -v '^#' | xargs)
    echo -e "${GREEN}✓ Environment variables loaded${NC}"
else
    echo -e "${YELLOW}⚠ No .env file found, using defaults${NC}"
fi

# Check if already running
if [ -f "${PID_FILE}" ]; then
    PID=$(cat "${PID_FILE}")
    if ps -p ${PID} > /dev/null 2>&1; then
        echo -e "${YELLOW}FLCM is already running (PID: ${PID})${NC}"
        exit 1
    else
        rm "${PID_FILE}"
    fi
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d 'v' -f 2 | cut -d '.' -f 1)
if [ "${NODE_VERSION}" -lt 16 ]; then
    echo -e "${RED}✗ Node.js 16+ required (found v${NODE_VERSION})${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Node.js version check passed${NC}"

# Build if needed
if [ ! -d "${APP_DIR}/dist" ]; then
    echo -e "${YELLOW}Building application...${NC}"
    cd "${APP_DIR}"
    npm run build
    echo -e "${GREEN}✓ Build completed${NC}"
fi

# Start services based on mode
MODE=${1:-all}

case ${MODE} in
    api)
        echo -e "${GREEN}Starting API server...${NC}"
        nohup node "${APP_DIR}/dist/api/flcm-api.js" \
            >> "${LOG_DIR}/api.log" 2>&1 &
        echo $! > "${PID_FILE}"
        ;;
    
    cli)
        echo -e "${GREEN}Starting CLI server...${NC}"
        node "${APP_DIR}/dist/cli/flcm-cli.js" server
        ;;
    
    worker)
        echo -e "${GREEN}Starting background worker...${NC}"
        nohup node "${APP_DIR}/dist/worker/worker.js" \
            >> "${LOG_DIR}/worker.log" 2>&1 &
        echo $! > "${PID_FILE}"
        ;;
    
    all)
        echo -e "${GREEN}Starting all services...${NC}"
        
        # Start API
        nohup node "${APP_DIR}/dist/api/flcm-api.js" \
            >> "${LOG_DIR}/api.log" 2>&1 &
        API_PID=$!
        
        # Store PIDs
        echo "${API_PID}" > "${PID_FILE}"
        
        echo -e "${GREEN}✓ All services started${NC}"
        echo "  API PID: ${API_PID}"
        ;;
    
    *)
        echo "Usage: $0 [api|cli|worker|all]"
        exit 1
        ;;
esac

# Wait for service to be ready
echo -n "Waiting for service to be ready"
for i in {1..30}; do
    if curl -s http://localhost:${PORT:-3000}/health > /dev/null 2>&1; then
        echo -e "\n${GREEN}✓ Service is ready!${NC}"
        echo -e "  URL: http://localhost:${PORT:-3000}"
        echo -e "  API Docs: http://localhost:${PORT:-3000}/api"
        echo -e "  Health: http://localhost:${PORT:-3000}/health"
        exit 0
    fi
    echo -n "."
    sleep 1
done

echo -e "\n${RED}✗ Service failed to start${NC}"
echo "Check logs at: ${LOG_DIR}"
exit 1
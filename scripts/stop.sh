#!/bin/bash

# FLCM Stop Script
# Gracefully stops the application

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PID_FILE="${APP_DIR}/.flcm.pid"

# Check if PID file exists
if [ ! -f "${PID_FILE}" ]; then
    echo -e "${YELLOW}FLCM is not running (no PID file found)${NC}"
    
    # Check for orphaned processes
    ORPHANS=$(ps aux | grep -E "flcm|dist/(api|cli|worker)" | grep -v grep | awk '{print $2}')
    if [ ! -z "${ORPHANS}" ]; then
        echo -e "${YELLOW}Found orphaned FLCM processes: ${ORPHANS}${NC}"
        echo -n "Kill them? (y/n): "
        read CONFIRM
        if [ "${CONFIRM}" = "y" ]; then
            echo ${ORPHANS} | xargs kill -TERM 2>/dev/null || true
            echo -e "${GREEN}✓ Orphaned processes terminated${NC}"
        fi
    fi
    exit 0
fi

# Read PID
PID=$(cat "${PID_FILE}")

# Check if process is running
if ! ps -p ${PID} > /dev/null 2>&1; then
    echo -e "${YELLOW}Process ${PID} is not running${NC}"
    rm "${PID_FILE}"
    exit 0
fi

# Send SIGTERM for graceful shutdown
echo -e "${YELLOW}Stopping FLCM (PID: ${PID})...${NC}"
kill -TERM ${PID}

# Wait for process to stop
echo -n "Waiting for graceful shutdown"
for i in {1..30}; do
    if ! ps -p ${PID} > /dev/null 2>&1; then
        echo -e "\n${GREEN}✓ FLCM stopped successfully${NC}"
        rm -f "${PID_FILE}"
        exit 0
    fi
    echo -n "."
    sleep 1
done

# Force kill if still running
echo -e "\n${YELLOW}Process did not stop gracefully, forcing termination...${NC}"
kill -KILL ${PID} 2>/dev/null || true
sleep 1

if ps -p ${PID} > /dev/null 2>&1; then
    echo -e "${RED}✗ Failed to stop FLCM${NC}"
    exit 1
else
    echo -e "${GREEN}✓ FLCM stopped (forced)${NC}"
    rm -f "${PID_FILE}"
fi
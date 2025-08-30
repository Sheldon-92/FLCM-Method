#!/bin/bash

# FLCM Health Check Script
# Monitors application health and services

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
API_URL="${API_URL:-http://localhost:3000}"
VERBOSE=${1:-false}

# ASCII Art Header
echo -e "${BLUE}"
echo "====================================="
echo "     FLCM Health Check Monitor       "
echo "====================================="
echo -e "${NC}"

# Function to check endpoint
check_endpoint() {
    local endpoint=$1
    local name=$2
    
    if curl -s -f -o /dev/null "${API_URL}${endpoint}"; then
        echo -e "${GREEN}✓${NC} ${name}"
        return 0
    else
        echo -e "${RED}✗${NC} ${name}"
        return 1
    fi
}

# Function to get response time
get_response_time() {
    local endpoint=$1
    local time=$(curl -s -o /dev/null -w "%{time_total}" "${API_URL}${endpoint}")
    echo "${time}"
}

# Function to check disk space
check_disk_space() {
    local path=$1
    local usage=$(df -h "${path}" | awk 'NR==2 {print $5}' | sed 's/%//')
    
    if [ ${usage} -lt 80 ]; then
        echo -e "${GREEN}✓${NC} Disk usage: ${usage}%"
    elif [ ${usage} -lt 90 ]; then
        echo -e "${YELLOW}⚠${NC} Disk usage: ${usage}% (warning)"
    else
        echo -e "${RED}✗${NC} Disk usage: ${usage}% (critical)"
    fi
}

# Function to check memory
check_memory() {
    if command -v free > /dev/null 2>&1; then
        local mem_usage=$(free | grep Mem | awk '{print int($3/$2 * 100)}')
        if [ ${mem_usage} -lt 80 ]; then
            echo -e "${GREEN}✓${NC} Memory usage: ${mem_usage}%"
        elif [ ${mem_usage} -lt 90 ]; then
            echo -e "${YELLOW}⚠${NC} Memory usage: ${mem_usage}% (warning)"
        else
            echo -e "${RED}✗${NC} Memory usage: ${mem_usage}% (critical)"
        fi
    else
        echo -e "${YELLOW}⚠${NC} Memory check not available"
    fi
}

# 1. Service Health
echo -e "${BLUE}Service Health:${NC}"
echo "------------------------"

check_endpoint "/health" "API Server"
check_endpoint "/api" "API Documentation"

# Get detailed health if verbose
if [ "${VERBOSE}" = "true" ] || [ "${VERBOSE}" = "-v" ]; then
    HEALTH_DETAILS=$(curl -s "${API_URL}/health/detailed" 2>/dev/null || echo "{}")
    if [ ! -z "${HEALTH_DETAILS}" ] && [ "${HEALTH_DETAILS}" != "{}" ]; then
        echo -e "${BLUE}  Details:${NC}"
        echo "${HEALTH_DETAILS}" | python -m json.tool 2>/dev/null || echo "${HEALTH_DETAILS}"
    fi
fi

echo ""

# 2. Performance Metrics
echo -e "${BLUE}Performance:${NC}"
echo "------------------------"

# Response times
API_TIME=$(get_response_time "/health")
echo -e "API Response Time: ${API_TIME}s"

# Check if response time is acceptable
if (( $(echo "${API_TIME} < 1" | bc -l) )); then
    echo -e "${GREEN}✓${NC} Response time is good"
elif (( $(echo "${API_TIME} < 3" | bc -l) )); then
    echo -e "${YELLOW}⚠${NC} Response time is acceptable"
else
    echo -e "${RED}✗${NC} Response time is slow"
fi

echo ""

# 3. System Resources
echo -e "${BLUE}System Resources:${NC}"
echo "------------------------"

check_disk_space "${APP_DIR}"
check_memory

# Check for data directories
echo -e "\n${BLUE}Data Directories:${NC}"
for dir in cache analytics users; do
    if [ -d "${APP_DIR}/data/${dir}" ]; then
        count=$(find "${APP_DIR}/data/${dir}" -type f | wc -l)
        size=$(du -sh "${APP_DIR}/data/${dir}" 2>/dev/null | cut -f1)
        echo -e "${GREEN}✓${NC} ${dir}: ${count} files (${size})"
    else
        echo -e "${YELLOW}⚠${NC} ${dir}: directory not found"
    fi
done

echo ""

# 4. Process Status
echo -e "${BLUE}Process Status:${NC}"
echo "------------------------"

# Check PID file
PID_FILE="${APP_DIR}/.flcm.pid"
if [ -f "${PID_FILE}" ]; then
    PID=$(cat "${PID_FILE}")
    if ps -p ${PID} > /dev/null 2>&1; then
        echo -e "${GREEN}✓${NC} Main process running (PID: ${PID})"
        
        # Get process info
        if [ "${VERBOSE}" = "true" ] || [ "${VERBOSE}" = "-v" ]; then
            ps -f -p ${PID}
        fi
    else
        echo -e "${RED}✗${NC} Process not running (stale PID: ${PID})"
    fi
else
    echo -e "${YELLOW}⚠${NC} No PID file found"
fi

# Check for Node processes
NODE_PROCS=$(ps aux | grep -E "node.*flcm" | grep -v grep | wc -l)
if [ ${NODE_PROCS} -gt 0 ]; then
    echo -e "${GREEN}✓${NC} ${NODE_PROCS} Node.js process(es) running"
else
    echo -e "${YELLOW}⚠${NC} No Node.js processes found"
fi

echo ""

# 5. Cache Status
echo -e "${BLUE}Cache Status:${NC}"
echo "------------------------"

# Check Redis if configured
if command -v redis-cli > /dev/null 2>&1; then
    if redis-cli ping > /dev/null 2>&1; then
        echo -e "${GREEN}✓${NC} Redis is running"
        if [ "${VERBOSE}" = "true" ] || [ "${VERBOSE}" = "-v" ]; then
            echo "  Keys: $(redis-cli dbsize | awk '{print $2}')"
            echo "  Memory: $(redis-cli info memory | grep used_memory_human | cut -d: -f2)"
        fi
    else
        echo -e "${YELLOW}⚠${NC} Redis is not running"
    fi
else
    echo -e "Memory cache in use (Redis not configured)"
fi

echo ""

# 6. Recent Logs
echo -e "${BLUE}Recent Logs:${NC}"
echo "------------------------"

LOG_DIR="${APP_DIR}/logs"
if [ -d "${LOG_DIR}" ]; then
    # Check for error logs
    if [ -f "${LOG_DIR}/error.log" ]; then
        ERROR_COUNT=$(tail -n 100 "${LOG_DIR}/error.log" 2>/dev/null | grep -c ERROR || echo 0)
        if [ ${ERROR_COUNT} -eq 0 ]; then
            echo -e "${GREEN}✓${NC} No recent errors"
        else
            echo -e "${YELLOW}⚠${NC} ${ERROR_COUNT} errors in last 100 log lines"
            if [ "${VERBOSE}" = "true" ] || [ "${VERBOSE}" = "-v" ]; then
                echo "Recent errors:"
                tail -n 5 "${LOG_DIR}/error.log" | sed 's/^/  /'
            fi
        fi
    fi
    
    # Show recent activity
    if [ -f "${LOG_DIR}/combined.log" ]; then
        echo "Recent activity:"
        tail -n 3 "${LOG_DIR}/combined.log" 2>/dev/null | sed 's/^/  /' || echo "  No recent activity"
    fi
else
    echo -e "${YELLOW}⚠${NC} Log directory not found"
fi

echo ""

# 7. Overall Status
echo "====================================="
FAILED=0

# Count failures
curl -s -f -o /dev/null "${API_URL}/health" || FAILED=$((FAILED + 1))

if [ ${FAILED} -eq 0 ]; then
    echo -e "${GREEN}✓ SYSTEM STATUS: HEALTHY${NC}"
    EXIT_CODE=0
else
    echo -e "${RED}✗ SYSTEM STATUS: UNHEALTHY${NC}"
    echo "  ${FAILED} component(s) failed"
    EXIT_CODE=1
fi
echo "====================================="

# Show help for verbose mode
if [ "${VERBOSE}" != "true" ] && [ "${VERBOSE}" != "-v" ]; then
    echo -e "\n${BLUE}Tip:${NC} Run with -v for detailed information"
fi

exit ${EXIT_CODE}
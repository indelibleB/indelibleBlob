#!/bin/bash
# Start MCP Server for indelible.Blob
# Usage: ./start_mcp_server.sh [background|foreground]

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
MCP_DIR="${MCP_DIR:-.}"
LOG_FILE="${LOG_FILE:-mcp_server.log}"
PID_FILE="${PID_FILE:-mcp_server.pid}"

# Check if .env file exists
if [ ! -f ~/.mcp-env ]; then
    echo -e "${RED}❌ Error: ~/.mcp-env not found${NC}"
    echo "Please create ~/.mcp-env with your GITHUB_TOKEN"
    echo "See MCP_LOCAL_SETUP_GUIDE.md for details"
    exit 1
fi

# Load environment variables
export $(cat ~/.mcp-env | xargs)

# Check if GITHUB_TOKEN is set
if [ -z "$GITHUB_TOKEN" ]; then
    echo -e "${RED}❌ Error: GITHUB_TOKEN not set${NC}"
    echo "Please set GITHUB_TOKEN in ~/.mcp-env"
    exit 1
fi

# Determine run mode
RUN_MODE="${1:-foreground}"

if [ "$RUN_MODE" = "background" ]; then
    echo -e "${GREEN}🚀 Starting MCP Server in background...${NC}"
    
    # Check if already running
    if [ -f "$PID_FILE" ]; then
        OLD_PID=$(cat "$PID_FILE")
        if kill -0 "$OLD_PID" 2>/dev/null; then
            echo -e "${YELLOW}⚠️  MCP Server already running (PID: $OLD_PID)${NC}"
            exit 0
        fi
    fi
    
    # Start in background
    nohup python3 "$MCP_DIR/mcp_server_enhanced.py" > "$LOG_FILE" 2>&1 &
    NEW_PID=$!
    echo $NEW_PID > "$PID_FILE"
    
    echo -e "${GREEN}✅ MCP Server started (PID: $NEW_PID)${NC}"
    echo -e "${GREEN}   Log file: $LOG_FILE${NC}"
    echo -e "${GREEN}   To stop: kill $NEW_PID${NC}"
    
elif [ "$RUN_MODE" = "foreground" ]; then
    echo -e "${GREEN}🚀 Starting MCP Server in foreground...${NC}"
    python3 "$MCP_DIR/mcp_server_enhanced.py"
    
elif [ "$RUN_MODE" = "stop" ]; then
    if [ -f "$PID_FILE" ]; then
        PID=$(cat "$PID_FILE")
        if kill -0 "$PID" 2>/dev/null; then
            kill "$PID"
            rm "$PID_FILE"
            echo -e "${GREEN}✅ MCP Server stopped (PID: $PID)${NC}"
        else
            echo -e "${YELLOW}⚠️  MCP Server not running${NC}"
            rm "$PID_FILE"
        fi
    else
        echo -e "${YELLOW}⚠️  No PID file found${NC}"
    fi
    
elif [ "$RUN_MODE" = "status" ]; then
    if [ -f "$PID_FILE" ]; then
        PID=$(cat "$PID_FILE")
        if kill -0 "$PID" 2>/dev/null; then
            echo -e "${GREEN}✅ MCP Server running (PID: $PID)${NC}"
            if [ -f "$LOG_FILE" ]; then
                echo -e "${GREEN}   Last 10 log lines:${NC}"
                tail -10 "$LOG_FILE"
            fi
        else
            echo -e "${RED}❌ MCP Server not running (stale PID: $PID)${NC}"
        fi
    else
        echo -e "${RED}❌ MCP Server not running${NC}"
    fi
    
else
    echo -e "${RED}❌ Unknown mode: $RUN_MODE${NC}"
    echo "Usage: $0 [foreground|background|stop|status]"
    echo ""
    echo "Modes:"
    echo "  foreground  - Run in foreground (default)"
    echo "  background  - Run in background"
    echo "  stop        - Stop the background server"
    echo "  status      - Check server status"
    exit 1
fi

#!/bin/bash
# start_with_serveo.sh
# Start Node server (moba-mini) lalu buka Serveo reverse-tunnel ke port (default 3333).
# USAGE:
#   PORT=3333 ./start_with_serveo.sh
# NOTE: Ensure ssh is installed. Serveo is a third-party service; bisa saja down.

set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "$0")" && pwd)"
SERVER_ENTRY="$PROJECT_ROOT/server/index.js"
PORT="${PORT:-3333}"
SSH_BIN="${SSH_BIN:-ssh}"
LOGFILE="$PROJECT_ROOT/serveo.log"
SSH_PID_FILE="$PROJECT_ROOT/serveo.pid"
NODE_PID_FILE="$PROJECT_ROOT/node.pid"

echo "📁 Project: $PROJECT_ROOT"
echo "🧭 Server entry: $SERVER_ENTRY"
echo "🔌 Port: $PORT"

# checks
command -v node >/dev/null 2>&1 || { echo "[!] node not found. Install Node.js (v16+)."; exit 1; }
command -v npm >/dev/null 2>&1 || { echo "[!] npm not found. Install Node.js/npm."; exit 1; }
command -v "$SSH_BIN" >/dev/null 2>&1 || { echo "[!] ssh not found. Install openssh-client."; exit 1; }
command -v curl >/dev/null 2>&1 || { echo "[!] curl not found. Install curl."; exit 1; }

# install deps if missing
cd "$PROJECT_ROOT"
if [ ! -d "node_modules" ]; then
  echo "📦 Installing dependencies..."
  npm install
fi

# kill anything running on PORT (best-effort)
if command -v fuser >/dev/null 2>&1; then
  fuser -k ${PORT}/tcp >/dev/null 2>&1 || true
fi

# start node server in background and log
echo "🚀 Starting Node server..."
PORT="$PORT" node "$SERVER_ENTRY" > server.log 2>&1 &
NODE_PID=$!
echo "$NODE_PID" > "$NODE_PID_FILE"

# wait for server to be ready
echo "⏳ Waiting for server on http://localhost:$PORT ..."
for i in $(seq 1 15); do
  if nc -z localhost "$PORT" 2>/dev/null; then
    echo "✅ Server responsive."
    break
  fi
  sleep 1
done

if ! nc -z localhost "$PORT" 2>/dev/null; then
  echo "[!] Server did not start on port $PORT. Check server.log"
  tail -n 100 server.log || true
  exit 1
fi

# cleanup function
cleanup() {
  echo
  echo "🧹 Cleaning up..."
  if [ -f "$SSH_PID_FILE" ]; then
    pid=$(cat "$SSH_PID_FILE")
    if kill -0 "$pid" >/dev/null 2>&1; then
      echo "🔪 Stopping serveo ssh (PID $pid)..."
      kill "$pid" >/dev/null 2>&1 || true
    fi
    rm -f "$SSH_PID_FILE"
  fi
  if [ -f "$NODE_PID_FILE" ]; then
    npid=$(cat "$NODE_PID_FILE")
    if kill -0 "$npid" >/dev/null 2>&1; then
      echo "🔪 Stopping node server (PID $npid)..."
      kill "$npid" >/dev/null 2>&1 || true
    fi
    rm -f "$NODE_PID_FILE"
  fi
  echo "Done."
  exit 0
}
trap cleanup INT TERM

# remove old logfile
rm -f "$LOGFILE"

echo "🔌 Opening Serveo tunnel -> localhost:$PORT"
# Start SSH reverse tunnel to serveo.net, write stdout to logfile
# Use -o ExitOnForwardFailure=yes to exit if bind fails
$SSH_BIN -o StrictHostKeyChecking=no -o ExitOnForwardFailure=yes -R 80:localhost:"$PORT" serveo.net 2>&1 | tee "$LOGFILE" &
SSH_PID=$!
echo "$SSH_PID" > "$SSH_PID_FILE"

# wait for URL in logfile
echo "⏳ Waiting for serveo URL in $LOGFILE ..."
URL=""
for i in $(seq 1 20); do
  sleep 1
  URL=$(grep -o 'https://[^ ]*serveo\.net' "$LOGFILE" | head -n1 || true)
  if [ -n "$URL" ]; then break; fi
done

if [ -z "$URL" ]; then
  echo "[!] Failed to get Serveo URL. See $LOGFILE"
  tail -n 200 "$LOGFILE" || true
  cleanup
fi

echo
echo "✅ Serveo public URL: $URL"
echo "➡ Open the URL in a browser to access your local server (localhost:$PORT)."
echo
echo "Press CTRL+C to stop and cleanup."

# show logs live until interrupted
tail -f "$LOGFILE"

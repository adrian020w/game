#!/bin/bash
# Mini MOBA Multiplayer + Serveo Tunnel
# Adrian

trap ctrl_c INT
ctrl_c() {
  echo -e "\n[!] Server + tunnel dihentikan."
  pkill -f node >/dev/null 2>&1
  exit 0
}

PROJECT_DIR=$(pwd)
ENTRY="$PROJECT_DIR/server/index.js"
PORT=3333

echo "📁 Project: $PROJECT_DIR"
echo "🧭 Server entry: $ENTRY"
echo "🔌 Port: $PORT"

# cek Node.js
if ! command -v node >/dev/null 2>&1; then
  echo "[!] Node.js belum terinstall. Install Node.js v16+."
  exit 1
fi

# install dep
if [ ! -d "node_modules" ]; then
  echo "[*] Menginstall dependency..."
  npm init -y >/dev/null 2>&1
  npm install express socket.io >/dev/null 2>&1
fi

# jalankan server
echo "[*] Menjalankan server Node.js..."
node $ENTRY &
SERVER_PID=$!

sleep 3

# buka tunnel Serveo
echo "[*] Membuka tunnel Serveo..."
ssh -o StrictHostKeyChecking=no -R 80:localhost:$PORT serveo.net

# matikan server kalau tunnel berhenti
kill $SERVER_PID

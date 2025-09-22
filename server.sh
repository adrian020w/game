#!/bin/bash
# Mini MOBA Server - Adrian
# Jalankan dengan: bash server.sh

trap ctrl_c INT
ctrl_c() {
  echo -e "\n[!] Dihentikan."
  pkill -f node >/dev/null 2>&1
  pkill -f "ssh -R 80:localhost:$PORT serveo.net" >/dev/null 2>&1
  exit 0
}

PROJECT_DIR=$(pwd)
ENTRY="$PROJECT_DIR/server/index.js"
PORT=3333

echo "📁 Project: $PROJECT_DIR"
echo "🧭 Server entry: $ENTRY"
echo "🔌 Port: $PORT"

# cek node
if ! command -v node >/dev/null 2>&1; then
  echo "[!] Node.js belum terinstall. Install Node.js v16+."
  exit 1
fi

# install dep kalau belum ada
if [ ! -d "node_modules" ]; then
  echo "[*] Menginstall dependency..."
  npm init -y >/dev/null 2>&1
  npm install express socket.io >/dev/null 2>&1
fi

echo "[*] Menjalankan server Node.js di background..."
node $ENTRY &

sleep 3
echo "🌐 Membuka akses publik via Serveo..."
ssh -o StrictHostKeyChecking=no -R 80:localhost:$PORT serveo.net

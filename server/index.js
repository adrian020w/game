const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

let players = {};
let ball = { x: 400, y: 250, vx: 0, vy: 0 };

function distance(a, b) {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

io.on("connection", (socket) => {
  console.log("Player connected:", socket.id);
  players[socket.id] = { x: 100, y: 100, skin: "hero1.png" };

  socket.emit("init", { id: socket.id, players, ball });
  socket.broadcast.emit("newPlayer", { id: socket.id, pos: players[socket.id] });

  socket.on("move", (pos) => {
    players[socket.id] = pos;

    // cek tabrakan player vs bola
    let player = pos;
    let dist = distance(player, ball);
    if (dist < 40) {
      // dorong bola menjauh
      let dx = ball.x - player.x;
      let dy = ball.y - player.y;
      let len = Math.sqrt(dx * dx + dy * dy) || 1;
      ball.vx = (dx / len) * 5;
      ball.vy = (dy / len) * 5;
    }

    io.emit("update", { id: socket.id, pos });
  });

  socket.on("disconnect", () => {
    delete players[socket.id];
    io.emit("removePlayer", socket.id);
  });
});

// update bola tiap frame
setInterval(() => {
  ball.x += ball.vx;
  ball.y += ball.vy;

  // friction biar bola pelan2 berhenti
  ball.vx *= 0.95;
  ball.vy *= 0.95;

  io.emit("ballUpdate", ball);
}, 50);

server.listen(3333, () => {
  console.log("Server running on http://localhost:3333");
});

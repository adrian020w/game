const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

let players = {};
let ball = { x: 400, y: 250, vx: 0, vy: 0 };

const canvasWidth = 800;
const canvasHeight = 500;

function distance(a, b) {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

io.on("connection", (socket) => {
  console.log("Player connected:", socket.id);
  players[socket.id] = { x: 100, y: 100, skin: "hero1.png" };

  socket.emit("init", { id: socket.id, players, ball });
  socket.broadcast.emit("newPlayer", { id: socket.id, pos: players[socket.id] });

  socket.on("move", (pos) => {
    pos.x = Math.max(0, Math.min(canvasWidth, pos.x));
    pos.y = Math.max(0, Math.min(canvasHeight, pos.y));
    players[socket.id] = pos;

    let dist = distance(pos, ball);
    if (dist < 40) {
      let dx = ball.x - pos.x;
      let dy = ball.y - pos.y;
      let len = Math.sqrt(dx*dx + dy*dy) || 1;
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

setInterval(() => {
  ball.x += ball.vx;
  ball.y += ball.vy;
  ball.x = Math.max(0, Math.min(canvasWidth, ball.x));
  ball.y = Math.max(0, Math.min(canvasHeight, ball.y));
  ball.vx *= 0.95;
  ball.vy *= 0.95;
  io.emit("ballUpdate", ball);
}, 50);

server.listen(3333, () => {
  console.log("Server running on http://localhost:3333");
});

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = 3333;

// serve file static
app.use(express.static(path.join(__dirname, "../public")));
app.use("/assets", express.static(path.join(__dirname, "../assets")));

let players = {};
let ball = { x: 400, y: 250, vx: 2, vy: 2 };

io.on("connection", (socket) => {
  console.log("Player connected:", socket.id);

  players[socket.id] = { x: Math.random() * 700, y: Math.random() * 400 };

  socket.emit("init", { id: socket.id, players, ball });
  socket.broadcast.emit("newPlayer", { id: socket.id, pos: players[socket.id] });

  socket.on("move", (pos) => {
    if (players[socket.id]) {
      players[socket.id] = pos;
      io.emit("update", { id: socket.id, pos });
    }
  });

  socket.on("disconnect", () => {
    console.log("Player disconnected:", socket.id);
    delete players[socket.id];
    io.emit("removePlayer", socket.id);
  });
});

// bola otomatis gerak
setInterval(() => {
  ball.x += ball.vx;
  ball.y += ball.vy;
  if (ball.x < 0 || ball.x > 800) ball.vx *= -1;
  if (ball.y < 0 || ball.y > 500) ball.vy *= -1;
  io.emit("ballUpdate", ball);
}, 50);

server.listen(PORT, () => {
  console.log(`Server jalan di http://localhost:${PORT}`);
});

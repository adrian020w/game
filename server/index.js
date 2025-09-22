// server/index.js
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

let players = {};

io.on("connection", (socket) => {
  console.log("Player connected:", socket.id);

  // default spawn position random sedikit supaya tidak tumpuk selalu
  players[socket.id] = { x: 100 + Math.floor(Math.random()*200), y: 100 + Math.floor(Math.random()*200) };

  socket.emit("currentPlayers", players);
  socket.broadcast.emit("newPlayer", { id: socket.id, ...players[socket.id] });

  socket.on("move", (data) => {
    if (players[socket.id]) {
      // simple server-side clamp
      players[socket.id].x = Math.max(0, Math.min(800, Math.round(data.x)));
      players[socket.id].y = Math.max(0, Math.min(600, Math.round(data.y)));
      io.emit("playerMoved", { id: socket.id, ...players[socket.id] });
    }
  });

  socket.on("disconnect", () => {
    console.log("Player disconnected:", socket.id);
    delete players[socket.id];
    io.emit("removePlayer", socket.id);
  });
});

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3333;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

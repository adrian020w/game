const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

let players = {};
let ball = { x: 400, y: 250 };

io.on("connection", (socket) => {
  console.log("Player connected:", socket.id);
  players[socket.id] = { x: 100, y: 100, skin: "hero1.png" };

  socket.emit("init", { id: socket.id, players, ball });
  socket.broadcast.emit("newPlayer", { id: socket.id, pos: players[socket.id] });

  socket.on("move", (pos) => {
    players[socket.id] = pos;
    io.emit("update", { id: socket.id, pos });
  });

  socket.on("disconnect", () => {
    delete players[socket.id];
    io.emit("removePlayer", socket.id);
  });
});

server.listen(3333, () => {
  console.log("Server running on http://localhost:3333");
});

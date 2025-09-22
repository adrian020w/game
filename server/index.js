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
  console.log("New player:", socket.id);
  // assign random color
  const colors = ["green","red","blue","yellow"];
  const color = colors[Math.floor(Math.random()*colors.length)];
  players[socket.id] = { x: 100, y: 100, color: color };

  socket.emit("init", { id: socket.id, players, ball });
  socket.broadcast.emit("newPlayer", { id: socket.id, pos: players[socket.id] });

  socket.on("move", (pos) => {
    if (players[socket.id]) {
      players[socket.id] = pos;
      socket.broadcast.emit("update", { id: socket.id, pos });
    }
  });

  socket.on("disconnect", () => {
    delete players[socket.id];
    io.emit("removePlayer", socket.id);
  });
});

const PORT = process.env.PORT || 3333;
server.listen(PORT, () => {
  console.log("Server running on port", PORT);
});

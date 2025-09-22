const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

const PORT = process.env.PORT || 3333;

app.use(express.static("public"));

let players = {};

io.on("connection", (socket) => {
  console.log("Player connected:", socket.id);

  // pilih hero random
  const textures = ["hero_red", "hero_blue", "hero_green"];
  const texture = textures[Math.floor(Math.random() * textures.length)];

  players[socket.id] = { playerId: socket.id, x: 100 + Math.random()*600, y: 100 + Math.random()*400, texture };

  socket.emit("currentPlayers", players);
  socket.broadcast.emit("newPlayer", players[socket.id]);

  socket.on("playerMovement", (movement) => {
    if (players[socket.id]) {
      players[socket.id].x = movement.x;
      players[socket.id].y = movement.y;
      io.emit("playerMoved", players[socket.id]);
    }
  });

  socket.on("disconnect", () => {
    console.log("Player disconnected:", socket.id);
    delete players[socket.id];
    io.emit("disconnectPlayer", socket.id);
  });
});

http.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

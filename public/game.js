const socket = io();

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let playerId;
let players = {};
let ball = { x: 400, y: 250 };

const heroImg = new Image();
heroImg.src = "/assets/hero1.png";

const ballImg = new Image();
ballImg.src = "/assets/ball.png";

socket.on("init", (data) => {
  playerId = data.id;
  players = data.players;
  ball = data.ball;
});

socket.on("newPlayer", (data) => {
  players[data.id] = data.pos;
});

socket.on("update", (data) => {
  players[data.id] = data.pos;
});

socket.on("removePlayer", (id) => {
  delete players[id];
});

socket.on("ballUpdate", (b) => {
  ball = b;
});

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // gambar pemain
  for (let id in players) {
    let p = players[id];
    ctx.drawImage(heroImg, p.x, p.y, 40, 40);
  }

  // gambar bola
  ctx.drawImage(ballImg, ball.x, ball.y, 30, 30);

  requestAnimationFrame(draw);
}
draw();

// kontrol keyboard
document.addEventListener("keydown", (e) => {
  if (!players[playerId]) return;
  let speed = 10;
  if (e.key === "ArrowUp") players[playerId].y -= speed;
  if (e.key === "ArrowDown") players[playerId].y += speed;
  if (e.key === "ArrowLeft") players[playerId].x -= speed;
  if (e.key === "ArrowRight") players[playerId].x += speed;
  socket.emit("move", players[playerId]);
});

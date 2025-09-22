const socket = io();

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let playerId;
let players = {};
let ball = { x: 400, y: 250 };

// === Asset gambar ===
const heroImgs = {
  green: new Image(),
  red: new Image(),
  blue: new Image(),
  yellow: new Image(),
};
heroImgs.green.src = "/assets/hero_green.png";
heroImgs.red.src = "/assets/hero_red.png";
heroImgs.blue.src = "/assets/hero_blue.png";
heroImgs.yellow.src = "/assets/hero_yellow.png";

const ballImg = new Image();
ballImg.src = "/assets/ball.png";

const fieldImg = new Image();
fieldImg.src = "/assets/field.png";

const goalLeftImg = new Image();
goalLeftImg.src = "/assets/goal_left.png";

const goalRightImg = new Image();
goalRightImg.src = "/assets/goal_right.png";

// === Socket events ===
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

// === Draw Loop ===
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // gambar lapangan
  ctx.drawImage(fieldImg, 0, 0, canvas.width, canvas.height);

  // gambar gawang kiri & kanan
  ctx.drawImage(goalLeftImg, 0, canvas.height / 2 - 50, 40, 100);
  ctx.drawImage(goalRightImg, canvas.width - 40, canvas.height / 2 - 50, 40, 100);

  // gambar bola
  ctx.drawImage(ballImg, ball.x, ball.y, 30, 30);

  // gambar pemain
  for (let id in players) {
    let p = players[id];
    let heroImg = heroImgs[p.color] || heroImgs.green; // default hijau
    ctx.drawImage(heroImg, p.x, p.y, 40, 40);
  }

  requestAnimationFrame(draw);
}
draw();

// === Kontrol Keyboard ===
document.addEventListener("keydown", (e) => {
  if (!players[playerId]) return;
  let speed = 10;
  if (e.key === "ArrowUp") players[playerId].y -= speed;
  if (e.key === "ArrowDown") players[playerId].y += speed;
  if (e.key === "ArrowLeft") players[playerId].x -= speed;
  if (e.key === "ArrowRight") players[playerId].x += speed;
  socket.emit("move", players[playerId]);
});

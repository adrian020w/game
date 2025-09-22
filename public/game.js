const socket = io();

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let playerId;
let players = {};
let ball = { x: 400, y: 250 };

// assets
const fieldImg = new Image();
fieldImg.src = "/assets/field.png";

const ballImg = new Image();
ballImg.src = "/assets/ball.png";

// pilih hero random saat connect
const heroList = ["hero1.png", "hero2.png"];
const myHero = new Image();
myHero.src = "/assets/" + heroList[Math.floor(Math.random() * heroList.length)];

const heroImages = {};
heroList.forEach(h => {
  const img = new Image();
  img.src = "/assets/" + h;
  heroImages[h] = img;
});

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

  // gambar lapangan
  ctx.drawImage(fieldImg, 0, 0, canvas.width, canvas.height);

  // gambar pemain
  for (let id in players) {
    let p = players[id];
    let img = heroImages[p.skin] || myHero;
    ctx.drawImage(img, p.x, p.y, 40, 40);
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

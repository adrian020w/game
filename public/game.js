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
const mySkin = heroList[Math.floor(Math.random() * heroList.length)];
const myHero = new Image();
myHero.src = "/assets/" + mySkin;

const heroImages = {};
heroList.forEach(h => {
  const img = new Image();
  img.src = "/assets/" + h;
  heroImages[h] = img;
});

// state tombol (keyboard + touch)
const keysPressed = { up:false, down:false, left:false, right:false };

const canvasWidth = canvas.width;
const canvasHeight = canvas.height;
const moveSpeed = 5;

socket.on("init", (data) => {
  playerId = data.id;
  players = data.players;
  ball = data.ball;

  if (players[playerId]) {
    players[playerId].skin = mySkin;
    socket.emit("move", players[playerId]);
  }
});

socket.on("newPlayer", (data) => { players[data.id] = data.pos; });
socket.on("update", (data) => { players[data.id] = data.pos; });
socket.on("removePlayer", (id) => { delete players[id]; });
socket.on("ballUpdate", (b) => { ball = b; });

// kontrol keyboard
document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowUp") keysPressed.up = true;
  if (e.key === "ArrowDown") keysPressed.down = true;
  if (e.key === "ArrowLeft") keysPressed.left = true;
  if (e.key === "ArrowRight") keysPressed.right = true;
});
document.addEventListener("keyup", (e) => {
  if (e.key === "ArrowUp") keysPressed.up = false;
  if (e.key === "ArrowDown") keysPressed.down = false;
  if (e.key === "ArrowLeft") keysPressed.left = false;
  if (e.key === "ArrowRight") keysPressed.right = false;
});

// kontrol touch HP (swipe/drag)
let touchStartX = null, touchStartY = null;
canvas.addEventListener("touchstart", (e) => {
  const t = e.touches[0];
  touchStartX = t.clientX;
  touchStartY = t.clientY;
});
canvas.addEventListener("touchmove", (e) => {
  if (!players[playerId]) return;
  const t = e.touches[0];
  const dx = t.clientX - touchStartX;
  const dy = t.clientY - touchStartY;

  players[playerId].x += dx / 20 * moveSpeed;
  players[playerId].y += dy / 20 * moveSpeed;

  // batas canvas
  players[playerId].x = Math.max(0, Math.min(canvasWidth-40, players[playerId].x));
  players[playerId].y = Math.max(0, Math.min(canvasHeight-40, players[playerId].y));

  touchStartX = t.clientX;
  touchStartY = t.clientY;

  socket.emit("move", players[playerId]);
});

// update posisi player tiap frame (tahan tombol)
function updatePlayer() {
  if (!players[playerId]) return;

  if (keysPressed.up) players[playerId].y -= moveSpeed;
  if (keysPressed.down) players[playerId].y += moveSpeed;
  if (keysPressed.left) players[playerId].x -= moveSpeed;
  if (keysPressed.right) players[playerId].x += moveSpeed;

  // batas canvas
  players[playerId].x = Math.max(0, Math.min(canvasWidth-40, players[playerId].x));
  players[playerId].y = Math.max(0, Math.min(canvasHeight-40, players[playerId].y));

  socket.emit("move", players[playerId]);
}

// gambar loop
function draw() {
  updatePlayer();

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // lapangan
  ctx.drawImage(fieldImg, 0, 0, canvas.width, canvas.height);

  // pemain
  for (let id in players) {
    let p = players[id];
    let img = heroImages[p.skin] || myHero;
    ctx.drawImage(img, p.x, p.y, 40, 40);
  }

  // bola
  ctx.drawImage(ballImg, ball.x, ball.y, 30, 30);

  requestAnimationFrame(draw);
}
draw();

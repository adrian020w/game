const socket = io();

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let playerId;
let players = {};
let ball = { x: 400, y: 250 };
let playerPos = { x: 100, y: 100 };

const canvasWidth = 800;
const canvasHeight = 500;
const moveSpeed = 5;

// state tombol
const keysPressed = {
  up: false,
  down: false,
  left: false,
  right: false
};

// init dari server
socket.on("init", (data) => {
  playerId = data.id;
  players = data.players;
  ball = data.ball;
  playerPos = players[playerId];
  requestAnimationFrame(gameLoop);
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

// tombol kontrol HP / desktop
const buttons = ["up","down","left","right"];
buttons.forEach(dir => {
  const el = document.getElementById(dir);

  const pressStart = (e) => { e.preventDefault(); keysPressed[dir] = true; };
  const pressEnd = (e) => { e.preventDefault(); keysPressed[dir] = false; };

  // HP
  el.addEventListener("touchstart", pressStart);
  el.addEventListener("touchend", pressEnd);
  el.addEventListener("touchcancel", pressEnd);

  // Desktop
  el.addEventListener("mousedown", pressStart);
  el.addEventListener("mouseup", pressEnd);
  el.addEventListener("mouseleave", pressEnd);
});

// keyboard support
document.addEventListener("keydown", (e) => {
  if(e.key==="ArrowUp") keysPressed.up = true;
  if(e.key==="ArrowDown") keysPressed.down = true;
  if(e.key==="ArrowLeft") keysPressed.left = true;
  if(e.key==="ArrowRight") keysPressed.right = true;
});

document.addEventListener("keyup", (e) => {
  if(e.key==="ArrowUp") keysPressed.up = false;
  if(e.key==="ArrowDown") keysPressed.down = false;
  if(e.key==="ArrowLeft") keysPressed.left = false;
  if(e.key==="ArrowRight") keysPressed.right = false;
});

// update posisi player tiap frame
function updatePlayer() {
  if(keysPressed.up) playerPos.y -= moveSpeed;
  if(keysPressed.down) playerPos.y += moveSpeed;
  if(keysPressed.left) playerPos.x -= moveSpeed;
  if(keysPressed.right) playerPos.x += moveSpeed;

  // batas canvas
  playerPos.x = Math.max(0, Math.min(canvasWidth, playerPos.x));
  playerPos.y = Math.max(0, Math.min(canvasHeight, playerPos.y));

  socket.emit("move", playerPos);
}

// loop gambar
function gameLoop() {
  updatePlayer();

  ctx.clearRect(0,0,canvas.width,canvas.height);

  // gambar bola
  ctx.fillStyle = "yellow";
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, 20, 0, Math.PI*2);
  ctx.fill();

  // gambar players
  for(let id in players){
    const p = players[id];
    ctx.fillStyle = id === playerId ? "blue" : "red";
    ctx.beginPath();
    ctx.arc(p.x, p.y, 20, 0, Math.PI*2);
    ctx.fill();
  }

  requestAnimationFrame(gameLoop);
}

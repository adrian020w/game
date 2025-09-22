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
const keysPressed = { up:false, down:false, left:false, right:false };

// init server
socket.on("init", data => {
  playerId = data.id;
  players = data.players;
  ball = data.ball;
  playerPos = players[playerId];
  requestAnimationFrame(gameLoop);
});

socket.on("newPlayer", data => { players[data.id] = data.pos; });
socket.on("update", data => { players[data.id] = data.pos; });
socket.on("removePlayer", id => { delete players[id]; });
socket.on("ballUpdate", b => { ball = b; });

// tombol HP / desktop
["up","down","left","right"].forEach(dir=>{
  const el = document.getElementById(dir);
  const pressStart = e=>{ e.preventDefault(); keysPressed[dir]=true; };
  const pressEnd = e=>{ e.preventDefault(); keysPressed[dir]=false; };
  el.addEventListener("touchstart", pressStart);
  el.addEventListener("touchend", pressEnd);
  el.addEventListener("touchcancel", pressEnd);
  el.addEventListener("mousedown", pressStart);
  el.addEventListener("mouseup", pressEnd);
  el.addEventListener("mouseleave", pressEnd);
});

// keyboard
document.addEventListener("keydown", e=>{
  if(e.key==="ArrowUp") keysPressed.up=true;
  if(e.key==="ArrowDown") keysPressed.down=true;
  if(e.key==="ArrowLeft") keysPressed.left=true;
  if(e.key==="ArrowRight") keysPressed.right=true;
});
document.addEventListener("keyup", e=>{
  if(e.key==="ArrowUp") keysPressed.up=false;
  if(e.key==="ArrowDown") keysPressed.down=false;
  if(e.key==="ArrowLeft") keysPressed.left=false;
  if(e.key==="ArrowRight") keysPressed.right=false;
});

// update player tiap frame
function updatePlayer() {
  if(keysPressed.up) playerPos.y -= moveSpeed;
  if(keysPressed.down) playerPos.y += moveSpeed;
  if(keysPressed.left) playerPos.x -= moveSpeed;
  if(keysPressed.right) playerPos.x += moveSpeed;

  playerPos.x = Math.max(0, Math.min(canvasWidth, playerPos.

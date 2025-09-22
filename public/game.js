// public/game.js
const socket = io();

let config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  parent: "game",
  backgroundColor: "#2d2d2d",
  physics: { default: "arcade" },
  scene: { preload, create, update }
};

let game = new Phaser.Game(config);
let cursors;
let player;
let otherPlayers = {};
let idToTint = {}; // supaya setiap pemain punya warna berbeda

function preload() {
  this.load.image("hero", "https://labs.phaser.io/assets/sprites/phaser-dude.png");
}

function create() {
  cursors = this.input.keyboard.createCursorKeys();

  socket.on("currentPlayers", (players) => {
    Object.keys(players).forEach((id) => {
      spawnPlayer(this, id, players[id]);
    });
  });

  socket.on("newPlayer", (data) => {
    spawnPlayer(this, data.id, data);
  });

  socket.on("playerMoved", (data) => {
    if (data.id === socket.id) return;
    if (otherPlayers[data.id]) {
      otherPlayers[data.id].setPosition(data.x, data.y);
    }
  });

  socket.on("removePlayer", (id) => {
    if (otherPlayers[id]) {
      otherPlayers[id].destroy();
      delete otherPlayers[id];
    }
  });
}

function spawnPlayer(scene, id, info) {
  const isMe = (id === socket.id);
  const sprite = scene.physics.add.image(info.x, info.y, "hero");
  if (isMe) {
    player = sprite.setTint(0x00ff00);
    scene.cameras.main.startFollow(player, true, 0.08, 0.08);
  } else {
    // assign consistent tint per id
    if (!idToTint[id]) {
      idToTint[id] = Phaser.Display.Color.RandomRGB().color;
    }
    sprite.setTint(idToTint[id]);
    otherPlayers[id] = sprite;
  }
}

function update() {
  if (!player) return;

  let moved = false;
  let speed = 3;

  if (cursors.left.isDown) { player.x -= speed; moved = true; }
  if (cursors.right.isDown) { player.x += speed; moved = true; }
  if (cursors.up.isDown) { player.y -= speed; moved = true; }
  if (cursors.down.isDown) { player.y += speed; moved = true; }

  // emit position at 20Hz-ish
  if (moved && !this._lastEmit || (Date.now() - (this._lastEmit || 0) > 50)) {
    socket.emit("move", { x: Math.round(player.x), y: Math.round(player.y) });
    this._lastEmit = Date.now();
  }
}

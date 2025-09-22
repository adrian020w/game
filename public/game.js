const socket = io();

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: { default: 'arcade' },
  scene: { preload, create, update }
};

let cursors, players = {};

const game = new Phaser.Game(config);

function preload() {
  this.load.image("map", "assets/map.png");
  this.load.image("hero_red", "assets/hero_red.png");
  this.load.image("hero_blue", "assets/hero_blue.png");
  this.load.image("hero_green", "assets/hero_green.png");
}

function create() {
  this.add.image(400, 300, "map"); // background map
  cursors = this.input.keyboard.createCursorKeys();

  socket.on("currentPlayers", (serverPlayers) => {
    Object.keys(serverPlayers).forEach((id) => {
      addPlayer(this, serverPlayers[id]);
    });
  });

  socket.on("newPlayer", (playerInfo) => {
    addPlayer(this, playerInfo);
  });

  socket.on("playerMoved", (playerInfo) => {
    const sprite = players[playerInfo.playerId];
    if (sprite) {
      sprite.setPosition(playerInfo.x, playerInfo.y);
    }
  });

  socket.on("disconnectPlayer", (id) => {
    if (players[id]) {
      players[id].destroy();
      delete players[id];
    }
  });
}

function update() {
  const player = players[socket.id];
  if (player) {
    let moved = false;
    if (cursors.left.isDown) { player.x -= 2; moved = true; }
    if (cursors.right.isDown) { player.x += 2; moved = true; }
    if (cursors.up.isDown) { player.y -= 2; moved = true; }
    if (cursors.down.isDown) { player.y += 2; moved = true; }

    if (moved) {
      socket.emit("playerMovement", { x: player.x, y: player.y });
    }
  }
}

function addPlayer(scene, playerInfo) {
  const key = playerInfo.texture;
  players[playerInfo.playerId] = scene.add.image(playerInfo.x, playerInfo.y, key);
}

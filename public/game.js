const socket = io();

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#eeeeee',
  physics: {
    default: 'arcade',
    arcade: { debug: false }
  },
  scene: {
    preload,
    create,
    update
  }
};

const game = new Phaser.Game(config);

let players = {};
let myPlayer;
let cursors;

function preload() {}

function create() {
  cursors = this.input.keyboard.createCursorKeys();

  socket.on('currentPlayers', serverPlayers => {
    Object.keys(serverPlayers).forEach(id => {
      if (id === socket.id) {
        myPlayer = this.add.rectangle(serverPlayers[id].x, serverPlayers[id].y, 40, 40, 0x0000ff);
        players[id] = myPlayer;
      } else {
        players[id] = this.add.rectangle(serverPlayers[id].x, serverPlayers[id].y, 40, 40, 0xff0000);
      }
    });
  });

  socket.on('newPlayer', player => {
    players[player.id] = this.add.rectangle(player.x, player.y, 40, 40, 0xff0000);
  });

  socket.on('playerMoved', data => {
    const player = players[data.id];
    if (player) {
      player.x = data.x;
      player.y = data.y;
    }
  });

  socket.on('playerDisconnected', id => {
    if (players[id]) {
      players[id].destroy();
      delete players[id];
    }
  });
}

function update() {
  if (!myPlayer) return;

  let moved = false;
  if (cursors.left.isDown) {
    myPlayer.x -= 3;
    moved = true;
  }
  if (cursors.right.isDown) {
    myPlayer.x += 3;
    moved = true;
  }
  if (cursors.up.isDown) {
    myPlayer.y -= 3;
    moved = true;
  }
  if (cursors.down.isDown) {
    myPlayer.y += 3;
    moved = true;
  }

  if (moved) {
    socket.emit('playerMovement', { x: myPlayer.x, y: myPlayer.y });
  }
}

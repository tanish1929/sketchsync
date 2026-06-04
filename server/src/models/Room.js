class Room {
  constructor(roomId, hostId) {
    this.roomId = roomId;
    this.hostId = hostId;

    this.players = [];

    this.gameStarted = false;

    // Game Flow
    this.currentRound = 1;
    this.maxRounds = 3;
    this.timeLeft = 60;

    // Current Word
    this.currentWord = "";

    // Current Drawer
    this.drawerIndex = 0;
  }

  addPlayer(player) {
    this.players.push(player);
  }

  removePlayer(playerId) {
    this.players = this.players.filter(
      (player) => player.id !== playerId
    );
  }

  getPlayer(playerId) {
    return this.players.find(
      (player) => player.id === playerId
    );
  }

  nextRound() {
    this.currentRound++;
    this.timeLeft = 60;
  }

  nextDrawer() {
    if (this.players.length === 0) return;

    this.drawerIndex =
      (this.drawerIndex + 1) %
      this.players.length;
  }
}

module.exports = Room;
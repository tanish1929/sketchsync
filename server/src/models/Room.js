class Room {
  constructor(roomId, hostId) {
    this.roomId = roomId;
    this.hostId = hostId;

    this.players = [];

    // Game State
    this.gameStarted = false;
    this.currentRound = 1;
    this.maxRounds = 3;
    this.timeLeft = 60;

    // Drawing Game
    this.currentWord = "";
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

  getCurrentDrawer() {
    if (this.players.length === 0) {
      return null;
    }

    return this.players[this.drawerIndex];
  }
}

module.exports = Room;
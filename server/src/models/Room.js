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
    // Check if player is already in the room to prevent duplicates
    const exists = this.players.some((p) => p.id === player.id);
    if (!exists) {
      this.players.push(player);
    }
  }

  removePlayer(playerId) {
    this.players = this.players.filter(
      (player) => player.id !== playerId
    );

    // FIX 1: Host Migration
    // If the host left and there are still players left, assign a new host!
    if (this.hostId === playerId && this.players.length > 0) {
      this.hostId = this.players[0].id;
    }

    // FIX 2: Prevent out-of-bounds drawer index crashes
    if (this.drawerIndex >= this.players.length) {
      this.drawerIndex = 0; // Reset safe index bounds
    }
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
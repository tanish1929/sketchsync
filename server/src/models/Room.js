class Room {
  constructor(roomId, hostId) {
    this.roomId = roomId;
    this.hostId = hostId;
    this.players = [];
    this.gameStarted = false;
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
}

module.exports = Room;
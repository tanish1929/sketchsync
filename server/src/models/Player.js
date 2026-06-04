class Player {
  constructor(id, name) {
    this.id = id;
    this.name = name;
    this.score = 0;
    this.isDrawer = false;
  }

  addPoints(points) {
    this.score += points;
  }

  setDrawer(status) {
    this.isDrawer = status;
  }
}

module.exports = Player;
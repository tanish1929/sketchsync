class Game {
  constructor() {
    this.round = 1;
    this.maxRounds = 3;
    this.currentWord = "";
    this.drawerIndex = 0;
    this.timeLeft = 60;
    this.started = false;
  }

  startGame() {
    this.started = true;
  }

  nextRound() {
    this.round++;
  }

  nextDrawer(players) {
    this.drawerIndex =
      (this.drawerIndex + 1) % players.length;
  }

  setWord(word) {
    this.currentWord = word;
  }
}

module.exports = Game;
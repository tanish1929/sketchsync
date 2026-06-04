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
    this.timeLeft = 60;
  }

  nextRound() {
    this.round++;
    this.timeLeft = 60;
  }

  nextDrawer(players) {
    if (!players || players.length === 0) return;

    this.drawerIndex =
      (this.drawerIndex + 1) %
      players.length;
  }

  setWord(word) {
    this.currentWord = word;
  }

  resetTimer() {
    this.timeLeft = 60;
  }

  isGameOver() {
    return this.round > this.maxRounds;
  }
}

module.exports = Game;
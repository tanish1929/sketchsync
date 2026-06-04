// Start Game
socket.on(
  "start_game",
  ({ roomId }) => {
    const room = rooms[roomId];

    if (!room) return;

    room.gameStarted = true;
    room.timeLeft = 60;

    const currentDrawer =
      room.getCurrentDrawer();

    io.to(roomId).emit(
      "game_started",
      {
        round: room.currentRound,
        timeLeft: room.timeLeft,
        drawer: currentDrawer?.name,
      }
    );

    const timer = setInterval(() => {
      room.timeLeft--;

      io.to(roomId).emit(
        "timer_update",
        room.timeLeft
      );

      if (room.timeLeft <= 0) {
        clearInterval(timer);

        room.nextRound();
        room.nextDrawer();

        if (
          room.currentRound >
          room.maxRounds
        ) {
          const winner =
            room.players.reduce(
              (best, player) =>
                player.score >
                best.score
                  ? player
                  : best,
              room.players[0]
            );

          io.to(roomId).emit(
            "game_over",
            {
              winner,
              players: room.players,
            }
          );
        } else {
          room.timeLeft = 60;

          room.currentWord =
            words[
              Math.floor(
                Math.random() *
                  words.length
              )
            ];

          const nextDrawer =
            room.getCurrentDrawer();

          io.to(roomId).emit(
            "next_round",
            {
              round:
                room.currentRound,
              drawer:
                nextDrawer?.name,
            }
          );
        }
      }
    }, 1000);
  }
);
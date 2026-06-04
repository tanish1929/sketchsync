const { v4: uuidv4 } = require("uuid");
const Room = require("../models/Room");
const Player = require("../models/Player");

const rooms = {};

const words = [
  "apple",
  "car",
  "house",
  "dog",
  "tree",
];

module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log("User Connected:", socket.id);

    // Create Room
    socket.on("create_room", ({ name }) => {
      const roomId = uuidv4().slice(0, 6);

      const room = new Room(roomId, socket.id);

      const player = new Player(
        socket.id,
        name
      );

      room.addPlayer(player);

      room.currentWord =
        words[
          Math.floor(
            Math.random() * words.length
          )
        ];

      rooms[roomId] = room;

      socket.join(roomId);

      socket.emit("room_created", {
        roomId,
        room,
      });

      console.log(`Room Created: ${roomId}`);
    });

    // Join Room
    socket.on("join_room", ({ roomId, name }) => {
      const room = rooms[roomId];

      if (!room) {
        socket.emit("error_message", {
          message: "Room not found",
        });
        return;
      }

      const player = new Player(
        socket.id,
        name
      );

      room.addPlayer(player);

      socket.join(roomId);

      io.to(roomId).emit(
        "player_joined",
        {
          players: room.players,
        }
      );

      console.log(
        `${name} joined room ${roomId}`
      );
    });

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
            round:
              room.currentRound,
            timeLeft:
              room.timeLeft,
            drawer:
              currentDrawer?.name,
          }
        );

        const timer =
          setInterval(() => {
            room.timeLeft--;

            io.to(roomId).emit(
              "timer_update",
              room.timeLeft
            );

            if (
              room.timeLeft <= 0
            ) {
              clearInterval(
                timer
              );

              room.nextRound();
              room.nextDrawer();

              if (
                room.currentRound >
                room.maxRounds
              ) {
                io.to(
                  roomId
                ).emit(
                  "game_over"
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

                io.to(
                  roomId
                ).emit(
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

    // Realtime Drawing
    socket.on("draw", (data) => {
      socket.broadcast.emit(
        "draw",
        data
      );
    });

    // Clear Canvas
    socket.on(
      "clear_canvas",
      () => {
        socket.broadcast.emit(
          "clear_canvas"
        );
      }
    );

    // Word Guessing + Scoring
    socket.on(
      "guess_word",
      ({
        roomId,
        guess,
        playerName,
      }) => {
        const room =
          rooms[roomId];

        if (!room) return;

        if (
          guess.toLowerCase() ===
          room.currentWord.toLowerCase()
        ) {
          const player =
            room.players.find(
              (p) =>
                p.name ===
                playerName
            );

          if (player) {
            player.addPoints(
              10
            );
          }

          io.to(roomId).emit(
            "score_update",
            room.players
          );

          io.to(roomId).emit(
            "correct_guess",
            {
              playerName,
              word:
                room.currentWord,
            }
          );

          console.log(
            `${playerName} guessed correctly`
          );
        } else {
          io.to(roomId).emit(
            "chat_message",
            {
              playerName,
              message: guess,
            }
          );
        }
      }
    );

    // Disconnect
    socket.on(
      "disconnect",
      () => {
        console.log(
          `User Disconnected: ${socket.id}`
        );
      }
    );
  });
};
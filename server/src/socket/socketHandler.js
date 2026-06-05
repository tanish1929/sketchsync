const { v4: uuidv4 } = require("uuid");
const Room = require("../models/Room");
const Player = require("../models/Player");

const rooms = {};

const words = [
  "apple",
  "banana",
  "car",
  "dog",
  "elephant",
  "flower",
  "guitar",
  "house",
  "ice",
  "jungle",
  "kite",
  "lamp",
  "mountain",
  "notebook",
  "orange",
  "piano",
  "queen",
  "rainbow",
  "sun",
  "tree",
];

module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log("User Connected:", socket.id);

    socket.on("create_room", ({ name }) => {
      const roomId = uuidv4().slice(0, 6);

      const room = new Room(roomId, socket.id);

      const player = new Player(socket.id, name);

      room.addPlayer(player);

      rooms[roomId] = room;

      socket.join(roomId);

      socket.emit("room_created", {
        roomId,
        room,
      });

      console.log(`Room Created: ${roomId}`);
    });

    socket.on("join_room", ({ roomId, name }) => {
      const room = rooms[roomId];

      if (!room) {
        socket.emit("error_message", {
          message: "Room not found",
        });
        return;
      }

      // Check if player already exists
      if (room.getPlayer(socket.id)) {
        io.to(roomId).emit("player_joined", {
          players: room.players,
        });
        return;
      }

      const player = new Player(socket.id, name);

      room.addPlayer(player);

      socket.join(roomId);

      io.to(roomId).emit("player_joined", {
        players: room.players,
      });

      console.log(`${name} joined room ${roomId}`);
    });

    // Start Game
    socket.on("start_game", ({ roomId }) => {
      const room = rooms[roomId];

      if (!room) return;

      room.gameStarted = true;
      room.timeLeft = 60;

      const currentDrawer = room.getCurrentDrawer();

      io.to(roomId).emit("game_started", {
        round: room.currentRound,
        timeLeft: room.timeLeft,
        drawer: currentDrawer?.name,
        drawerId: currentDrawer?.id,
      });

      // Send word options to drawer only
      const wordOptions = [];
      const selectedIndices = new Set();
      while (wordOptions.length < Math.min(5, words.length)) {
        const idx = Math.floor(Math.random() * words.length);
        if (!selectedIndices.has(idx)) {
          wordOptions.push(words[idx]);
          selectedIndices.add(idx);
        }
      }

      io.to(roomId).emit("round_start", {
        drawerId: currentDrawer?.id,
        wordOptions,
        drawTime: 60,
      });
    });

    // Handle Word Choice by Drawer
    socket.on("word_chosen", ({ roomId, word, playerName }) => {
      const room = rooms[roomId];

      if (!room) return;

      room.currentWord = word.toLowerCase();

      // Send word hint to all players (except drawer sees blank too)
      const hint = room.currentWord
        .split("")
        .map(() => "_")
        .join(" ");

      io.to(roomId).emit("word_hint", {
        hint,
      });

      io.to(roomId).emit("chat_message", {
        playerName: "System",
        message: `${playerName} has chosen a word. Start guessing!`,
      });

      // Start timer after word is chosen
      let gameTimer = null;
      let roundTimeLeft = 60;

      gameTimer = setInterval(() => {
        roundTimeLeft--;

        io.to(roomId).emit("timer_update", roundTimeLeft);

        if (roundTimeLeft <= 0) {
          clearInterval(gameTimer);

          // Round ended - show word and scores
          io.to(roomId).emit("round_end", {
            word: room.currentWord,
            scores: room.players.map((p) => ({
              name: p.name,
              score: p.score,
            })),
          });

          room.nextRound();
          room.nextDrawer();

          if (room.currentRound > room.maxRounds) {
            const winner = room.players.reduce(
              (best, player) =>
                player.score > best.score ? player : best,
              room.players[0]
            );

            io.to(roomId).emit("game_over", {
              winner: {
                name: winner.name,
                score: winner.score,
              },
              leaderboard: room.players
                .sort((a, b) => b.score - a.score)
                .map((p) => ({
                  name: p.name,
                  score: p.score,
                })),
            });
          } else {
            // Start next round
            const nextDrawer = room.getCurrentDrawer();

            io.to(roomId).emit("game_started", {
              round: room.currentRound,
              drawer: nextDrawer?.name,
              drawerId: nextDrawer?.id,
            });

            // Send word options to next drawer
            const wordOptions = [];
            const selectedIndices = new Set();
            while (wordOptions.length < Math.min(5, words.length)) {
              const idx = Math.floor(Math.random() * words.length);
              if (!selectedIndices.has(idx)) {
                wordOptions.push(words[idx]);
                selectedIndices.add(idx);
              }
            }

            socket.to(roomId).emit("round_start", {
              drawerId: nextDrawer?.id,
              wordOptions,
              drawTime: 60,
            });
          }
        }
      }, 1000);

      // Store timer reference for cleanup if needed
      room.gameTimer = gameTimer;
    });
    socket.on("guess_word", ({ roomId, guess, playerName }) => {
      const room = rooms[roomId];

      if (!room) return;

      // Check if the guess is correct (case-insensitive)
      if (guess.toLowerCase() === room.currentWord.toLowerCase()) {
        // Find the player who guessed correctly
        const player = room.getPlayer(socket.id);
        if (player) {
          player.score += 10; // Award points for correct guess
        }

        // Broadcast correct guess to all players
        io.to(roomId).emit("correct_guess", {
          playerName,
          word: room.currentWord,
        });
      } else {
        // Broadcast incorrect guess
        io.to(roomId).emit("chat_message", {
          playerName,
          message: `guessed "${guess}"`,
        });
      }
    });

    // Handle Canvas Drawing
    socket.on("draw", ({ roomId, x, y, color, brushSize }) => {
      const room = rooms[roomId];
      if (!room) return;

      // Broadcast the drawing to all other players in the room
      socket.to(roomId).emit("draw", {
        x,
        y,
        color,
        brushSize,
      });
    });

    // Handle Canvas Clear
    socket.on("clear_canvas", ({ roomId }) => {
      const room = rooms[roomId];
      if (!room) return;

      // Broadcast clear event to all other players in the room
      socket.to(roomId).emit("clear_canvas");
    });
  });
};
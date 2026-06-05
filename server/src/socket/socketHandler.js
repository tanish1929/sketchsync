const { v4: uuidv4 } = require("uuid");
const Room = require("../models/Room");
const Player = require("../models/Player");

const rooms = {};

const words = [
  "apple", "banana", "car", "dog", "elephant", "flower", "guitar", "house", 
  "ice", "jungle", "kite", "lamp", "mountain", "notebook", "orange", "piano", 
  "queen", "rainbow", "sun", "tree"
];

// Helper function to generate 3 random unique words
const getRandomWords = () => {
  const wordOptions = [];
  const selectedIndices = new Set();
  while (wordOptions.length < Math.min(3, words.length)) {
    const idx = Math.floor(Math.random() * words.length);
    if (!selectedIndices.has(idx)) {
      wordOptions.push(words[idx]);
      selectedIndices.add(idx);
    }
  }
  return wordOptions;
};

module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log("User Connected:", socket.id);

    // --- CREATE ROOM ---
    socket.on("create_room", ({ name }) => {
      const roomId = uuidv4().slice(0, 6);
      const room = new Room(roomId, socket.id);
      const player = new Player(socket.id, name);

      room.addPlayer(player);
      rooms[roomId] = room;

      socket.join(roomId);

      // Match the structure Room.jsx expects
      socket.emit("room_created", {
        roomId,
        room: { players: room.players }
      });

      console.log(`Room Created: ${roomId} by ${name}`);
    });

    // --- JOIN ROOM ---
    socket.on("join_room", ({ roomId, name }) => {
      const room = rooms[roomId];

      if (!room) {
        socket.emit("error_message", { message: "Room not found" });
        return;
      }

      socket.join(roomId);

      // Add player if they aren't already registered
      if (!room.getPlayer(socket.id)) {
        const player = new Player(socket.id, name);
        room.addPlayer(player);
      }

      // Sync the whole room's player list array
      io.to(roomId).emit("player_joined", {
        players: room.players,
      });

      console.log(`${name} joined room ${roomId}`);
    });

    // --- START GAME ---
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

      // Send word choices to the drawer
      io.to(roomId).emit("round_start", {
        drawerId: currentDrawer?.id,
        wordOptions: getRandomWords(),
        drawTime: 60,
      });
    });

    // --- WORD CHOSEN ---
    socket.on("word_chosen", ({ roomId, word, playerName }) => {
      const room = rooms[roomId];
      if (!room) return;

      // Safety check: clear any running timer before starting a new one
      if (room.gameTimer) {
        clearInterval(room.gameTimer);
      }

      room.currentWord = word.toLowerCase();

      // Build hidden word string hint
      const hint = room.currentWord
        .split("")
        .map((char) => (char === " " ? " " : "_"))
        .join(" ");

      io.to(roomId).emit("word_hint", { hint });

      io.to(roomId).emit("chat_message", {
        playerName: "System",
        message: `${playerName} has chosen a word. Start guessing!`,
      });

      let roundTimeLeft = 60;

      room.gameTimer = setInterval(() => {
        roundTimeLeft--;
        io.to(roomId).emit("timer_update", roundTimeLeft);

        if (roundTimeLeft <= 0) {
          clearInterval(room.gameTimer);

          io.to(roomId).emit("round_end", {
            word: room.currentWord,
            scores: room.players.map((p) => ({ name: p.name, score: p.score })),
          });

          room.nextRound();
          room.nextDrawer();

          // Check if match is finished
          if (room.currentRound > room.maxRounds) {
            const winner = room.players.reduce(
              (best, player) => (player.score > best.score ? player : best),
              room.players[0]
            );

            io.to(roomId).emit("game_over", {
              winner: { name: winner.name, score: winner.score },
              leaderboard: [...room.players]
                .sort((a, b) => b.score - a.score)
                .map((p) => ({ name: p.name, score: p.score })),
            });
          } else {
            // Setup Next Round
            const nextDrawer = room.getCurrentDrawer();

            io.to(roomId).emit("game_started", {
              round: room.currentRound,
              drawer: nextDrawer?.name,
              drawerId: nextDrawer?.id,
            });

            io.to(roomId).emit("round_start", {
              drawerId: nextDrawer?.id,
              wordOptions: getRandomWords(),
              drawTime: 60,
            });
          }
        }
      }, 1000);
    });

    // --- GUESS WORD ---
    socket.on("guess_word", ({ roomId, guess, playerName }) => {
      const room = rooms[roomId];
      if (!room || !room.currentWord) return;

      if (guess.toLowerCase() === room.currentWord.toLowerCase()) {
        const player = room.getPlayer(socket.id);
        if (player) {
          player.score += 10; // Award points
        }

        io.to(roomId).emit("correct_guess", {
          playerName,
          word: room.currentWord,
        });

        // Sync updated scoreboard instantly
        io.to(roomId).emit("player_joined", { players: room.players });
      } else {
        io.to(roomId).emit("chat_message", {
          playerName,
          message: `guessed "${guess}"`,
        });
      }
    });

    // --- CANVAS SYNCHRONIZATION EVENTS ---
    socket.on("draw", (data) => {
      const { roomId } = data;
      // Broadcast coordinates seamlessly to all room subscribers (except sender)
      socket.to(roomId).emit("draw", data);
    });

    socket.on("clear_canvas", ({ roomId }) => {
      socket.to(roomId).emit("clear_canvas");
    });

    // --- HANDLE DISCONNECT & ROOM LEAVING ---
    socket.on("disconnecting", () => {
      for (const roomId of socket.rooms) {
        const room = rooms[roomId];
        if (room) {
          room.removePlayer(socket.id);

          // If nobody is left, scrap the room and clear timers to prevent memory leaks
          if (room.players.length === 0) {
            if (room.gameTimer) clearInterval(room.gameTimer);
            delete rooms[roomId];
            console.log(`Room ${roomId} deleted (Empty).`);
          } else {
            // Update the remaining players on the array structure modification
            io.to(roomId).emit("player_joined", {
              players: room.players,
            });
          }
        }
      }
      console.log("User Disconnected:", socket.id);
    });
  });
};
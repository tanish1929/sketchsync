const { v4: uuidv4 } = require("uuid");
const Room = require("../models/Room");
const Player = require("../models/Player");

const rooms = {};

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

      io.to(roomId).emit("player_joined", {
        players: room.players,
      });

      console.log(
        `${name} joined room ${roomId}`
      );
    });

    // Realtime Drawing
    socket.on("draw", (data) => {
      socket.broadcast.emit("draw", data);
    });

    // Clear Canvas
    socket.on("clear_canvas", () => {
      socket.broadcast.emit(
        "clear_canvas"
      );
    });

    // Disconnect
    socket.on("disconnect", () => {
      console.log(
        `User Disconnected: ${socket.id}`
      );
    });
  });
};
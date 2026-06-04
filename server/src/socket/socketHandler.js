const { v4: uuidv4 } = require("uuid");
const Room = require("../models/Room");
const Player = require("../models/Player");

const rooms = {};

module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log("User Connected:", socket.id);

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

      console.log('Room Created: ${roomId}');
    });

    socket.on("join_room", ({ roomId, name }) => {

      const room = rooms[roomId];

      if (!room) {
        socket.emit("error_message", {
          message: "Room not found"
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
        players: room.players
      });

      console.log(
        '${name} joined room ${roomId}'
      );
    });
  });
};
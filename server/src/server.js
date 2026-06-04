const socketHandler = require("./socket/socketHandler");
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();

app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

socketHandler(io);

io.on("connection", (socket) => {
  console.log("User Connected:", socket.id);
});

server.listen(5000, () => {
  console.log("Server Running On Port 5000");
});
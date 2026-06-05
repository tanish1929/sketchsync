require("dotenv").config();

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();

const server =
  http.createServer(app);

const io = new Server(server, {
  cors: {
    origin:
      process.env.CLIENT_URL,
    credentials: true,
  },
});

require("./socket/socketHandler")(io);

server.listen(
  process.env.PORT || 5000,
  () => {
    console.log(
      "Server running on port 5000"
    );
  }
);
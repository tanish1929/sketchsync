require("dotenv").config();

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const socketHandler = require("./socket/socketHandler");

const app = express();
const server = http.createServer(app);

app.get("/", (req, res) => {
  res.send("SketchSync Backend Running 🚀");
});

const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      process.env.CLIENT_URL,
    ],
    credentials: true,
  },
});

// Register all Socket.IO events
socketHandler(io);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
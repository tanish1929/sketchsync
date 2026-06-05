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

// Clean up the environment URL (removes trailing slash if present)
const clientUrl = process.env.CLIENT_URL ? process.env.CLIENT_URL.replace(/\/$/, "") : null;

// Configure Socket.IO with strict CORS settings
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      clientUrl,
      "https://sketchsync-eight.vercel.app" // Hardcoded fallback for production stability
    ].filter(Boolean), // Removes null/undefined entries from the array
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Register all Socket.IO events
socketHandler(io);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
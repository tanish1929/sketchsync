import { io } from "socket.io-client";


const SOCKET_URL = import.meta.env.VITE_BACKEND_URL || "https://sketchsync-1yu1.onrender.com";

export const socket = io(SOCKET_URL, {
  transports: ["websocket"], 
  autoConnect: true,
});
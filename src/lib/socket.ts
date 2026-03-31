import { io } from "socket.io-client";

export const socket = io("https://mscreations-backend.onrender.com", {
  transports: ["websocket"],
  autoConnect: false, // ✅ REQUIRED
  timeout: 20000, // ✅ prevents early timeout
});

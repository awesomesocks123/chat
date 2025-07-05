import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173"]
  }
});

export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

// store online users
const userSocketMap = {}; // userId: socketId

// Store active chat sessions for each user
const userChatSessions = {}; // userId: [sessionIds]

io.on("connection", (socket) => {
  console.log("A user connected", socket.id);
  const userId = socket.handshake.query.userId;

  if (userId) {
    userSocketMap[userId] = socket.id;

    // Join rooms for all active chat sessions
    if (userChatSessions[userId]) {
      userChatSessions[userId].forEach(sessionId => {
        socket.join(`chat_session_${sessionId}`);
      });
    }
  }

  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // Handle joining a chat session
  socket.on("joinChatSession", (sessionId) => {
    console.log(`User ${userId} joining chat session ${sessionId}`);
    socket.join(`chat_session_${sessionId}`);

    // Track this session for the user
    if (!userChatSessions[userId]) {
      userChatSessions[userId] = [];
    }
    if (!userChatSessions[userId].includes(sessionId)) {
      userChatSessions[userId].push(sessionId);
    }
  });
  // Handle disconnect
  socket.on("disconnect", () => {
    console.log("A user disconnected", socket.id);
    delete userSocketMap[userId];
    delete userChatSessions[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });

  //join public room

  socket.on("joinPublicRoom", (roomId) => {
    socket.join(roomId);
    console.log(`User ${userId} joining public room ${roomId}`);

    if (!userSocketMap[userId]) {
      userSocketMap[userId] = [];
    }
    if (!userSocketMap[userId].includes(roomId)) {
      userSocketMap[userId].push(roomId);
    }
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });

  //leave public room
  socket.on("leavePublicRoom", (roomId) => {
    socket.leave(roomId);
    delete userSocketMap[userId];
    console.log(`User ${userId} leaving public room ${roomId}`);
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });




});

export { io, app, server };

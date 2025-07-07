import { Server } from "socket.io";
import http from "http";
import express from "express";
import { initSocketIO } from "../socket/socket.js";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173"]
  }
});

// Initialize our socket module with the io instance
initSocketIO(io);

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

    // userSocketMap should just store the socketId for each userId
    // No need to track rooms here as socket.rooms already does this
    userSocketMap[userId] = socket.id;
    
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });

  //leave public room
  socket.on("leavePublicRoom", (roomId) => {
    socket.leave(roomId);
    // Don't delete the user from userSocketMap, they're just leaving a room
    // Only remove them on full disconnect
    console.log(`User ${userId} leaving public room ${roomId}`);
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
  
  // Leave all public rooms
  socket.on("leaveAllRooms", () => {
    // Get all rooms this socket is in
    const rooms = Array.from(socket.rooms);
    
    // The first room is always the socket ID, so we skip it
    for (let i = 1; i < rooms.length; i++) {
      const room = rooms[i];
      // Only leave rooms that are not chat sessions
      if (!room.startsWith('chat_session_')) {
        socket.leave(room);
        console.log(`User ${userId} leaving room ${room}`);
      }
    }
    
    console.log(`User ${userId} left all public rooms`);
  });

});

export { io, app, server };

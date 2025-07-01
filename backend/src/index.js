import express, { application } from "express";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import friendRoutes from "./routes/friend.routes.js";
import chatSessionRoutes from "./routes/chatSession.routes.js";
import userRoutes from "./routes/user.routes.js";
import blockedUserRoutes from "./routes/blockedUser.routes.js";
import { connectDB } from "./lib/db.js";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import {app, server} from "./lib/socket.js"
dotenv.config();

const PORT = process.env.PORT;

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/friends", friendRoutes);
app.use("/api/chat-sessions", chatSessionRoutes);
app.use("/api/users", userRoutes);
app.use("/api/blocked-users", blockedUserRoutes);

server.listen(5001, () => {
  console.log("server is running on port " + PORT);
  connectDB();
});

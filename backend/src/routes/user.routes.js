import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { getUserRecentMessages, markMessagesAsRead } from "../controllers/user.controller.js";

const router = express.Router();

// Get recent messages for the current user
router.get("/recent-messages", protectRoute, getUserRecentMessages);

// Mark messages as read for a specific chat session
router.post("/mark-read/:chatSessionId", protectRoute, markMessagesAsRead);

export default router;

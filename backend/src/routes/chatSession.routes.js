import express from "express";
import { 
  getOrCreateChatSession, 
  getUserChatSessions, 
  sendMessage, 
  getChatSessionMessages,
  createRandomChatMatch
} from "../controllers/chatSession.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

// All routes are protected
router.use(protectRoute);

// Get all chat sessions for current user
router.get("/", getUserChatSessions);

// Create a random chat match - must be before /:userId route
router.get("/random/match", createRandomChatMatch);

// Get or create a chat session with another user
router.get("/:userId", getOrCreateChatSession);

// Get messages for a specific chat session
router.get("/:sessionId/messages", getChatSessionMessages);

// Send a message in a chat session
router.post("/:sessionId/messages", sendMessage);

export default router;

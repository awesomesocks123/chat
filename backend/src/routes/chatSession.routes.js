import express from "express";
import { 
  getOrCreateChatSession, 
  getUserChatSessions, 
  sendMessage, 
  getChatSessionMessages,
  createRandomChatMatch,
  deleteChatSession
} from "../controllers/chatSession.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import ChatSession from "../models/chatSession.model.js";

const router = express.Router();

// All routes are protected
router.use(protectRoute);

// Get all chat sessions for current user
router.get("/", getUserChatSessions);

// Create a random chat match - must be before /:userId route
router.get("/random/match", createRandomChatMatch);

// Get a specific chat session by ID
router.get("/session/:sessionId", async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user._id;

    // Find the chat session and verify user is a participant
    const chatSession = await ChatSession.findOne({
      _id: sessionId,
      participants: userId
    }).populate("participants", "fullName profilePic");

    if (!chatSession) {
      return res.status(404).json({ error: "Chat session not found or you're not a participant" });
    }

    res.status(200).json(chatSession);
  } catch (error) {
    console.error("Error getting chat session:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get or create a chat session with another user
router.get("/user/:userId", getOrCreateChatSession);

// Get messages for a specific chat session
router.get("/:sessionId/messages", getChatSessionMessages);

// Delete a chat session
router.delete("/session/:sessionId", deleteChatSession);

// Send a message in a chat session
router.post("/:sessionId/messages", sendMessage);

export default router;

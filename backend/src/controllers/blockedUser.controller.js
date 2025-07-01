import BlockedUser from "../models/blockedUser.model.js";
import User from "../models/user.model.js";
import ChatSession from "../models/chatSession.model.js";

// Block a user and delete any existing chat session
export const blockUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const blockerId = req.user._id;
    
    // Prevent blocking yourself
    if (userId === blockerId.toString()) {
      return res.status(400).json({ error: "You cannot block yourself" });
    }
    
    // Check if the user exists
    const userToBlock = await User.findById(userId);
    if (!userToBlock) {
      return res.status(404).json({ error: "User not found" });
    }
    
    // Check if already blocked
    const existingBlock = await BlockedUser.findOne({
      blocker: blockerId,
      blocked: userId
    });
    
    if (existingBlock) {
      return res.status(400).json({ error: "User is already blocked" });
    }
    
    // Create block record
    const newBlock = new BlockedUser({
      blocker: blockerId,
      blocked: userId,
      reason: req.body.reason || ""
    });
    
    await newBlock.save();
    
    // Find and delete any existing chat session between the users
    const chatSession = await ChatSession.findOne({
      participants: { $all: [blockerId, userId] }
    });
    
    if (chatSession) {
      const chatSessionId = chatSession._id;
      
      // Remove chat session from both users' active chats
      await User.updateMany(
        { _id: { $in: chatSession.participants } },
        { $pull: { activeChats: chatSessionId } }
      );
      
      // Remove chat session from both users' recent messages
      await User.updateMany(
        { "recentMessages.chatSessionId": chatSessionId },
        { $pull: { recentMessages: { chatSessionId } } }
      );
      
      // Delete the chat session
      await ChatSession.findByIdAndDelete(chatSessionId);
    }
    
    res.status(200).json({ message: "User blocked successfully" });
  } catch (error) {
    console.error("Error in blockUser:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get all blocked users for the current user
export const getBlockedUsers = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const blockedUsers = await BlockedUser.find({ blocker: userId })
      .populate("blocked", "fullName email profilePic")
      .sort({ createdAt: -1 });
    
    res.status(200).json(blockedUsers);
  } catch (error) {
    console.error("Error in getBlockedUsers:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Unblock a user
export const unblockUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const blockerId = req.user._id;
    
    const result = await BlockedUser.findOneAndDelete({
      blocker: blockerId,
      blocked: userId
    });
    
    if (!result) {
      return res.status(404).json({ error: "Block record not found" });
    }
    
    res.status(200).json({ message: "User unblocked successfully" });
  } catch (error) {
    console.error("Error in unblockUser:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Create a report for a user
export const reportUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const reporterId = req.user._id;
    const { reason } = req.body;
    
    if (!reason || reason.trim() === "") {
      return res.status(400).json({ error: "Report reason is required" });
    }
    
    // In a real application, you would save this report to a database
    // For now, we'll just log it and return success
    console.log(`User ${reporterId} reported user ${userId} for: ${reason}`);
    
    res.status(200).json({ message: "User reported successfully" });
  } catch (error) {
    console.error("Error in reportUser:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

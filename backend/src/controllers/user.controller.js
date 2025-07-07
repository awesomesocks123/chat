import User from "../models/user.model.js";

// Get recent messages for the current user
export const getUserRecentMessages = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Find the user and populate the otherUser field in recentMessages
    const user = await User.findById(userId)
      .populate({
        path: "recentMessages.otherUser",
        select: "fullName username profilePic"
      });
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    // Sort recent messages by the lastMessage.createdAt in descending order
    const sortedRecentMessages = user.recentMessages.sort((a, b) => {
      return new Date(b.lastMessage?.createdAt || 0) - new Date(a.lastMessage?.createdAt || 0);
    });
    
    res.status(200).json(sortedRecentMessages);
  } catch (error) {
    console.error("Error in getUserRecentMessages:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Update a user's recent messages when a new message is sent or received
export const updateUserRecentMessage = async (userId, chatSessionId, otherUserId, message) => {
  try {
    const user = await User.findById(userId);
    
    if (!user) {
      console.error(`User ${userId} not found for updating recent messages`);
      return false;
    }
    
    // Check if this chat session already exists in recentMessages
    const existingIndex = user.recentMessages.findIndex(
      item => item.chatSessionId.toString() === chatSessionId.toString()
    );
    
    // Create the new recent message entry
    const recentMessageEntry = {
      chatSessionId,
      otherUser: otherUserId,
      lastMessage: {
        text: message.text,
        image: message.image,
        sender: message.sender,
        createdAt: message.createdAt
      },
      // If the message is from the other user and it's a new message, increment unread count
      unreadCount: message.sender.toString() !== userId.toString() 
        ? (existingIndex >= 0 ? user.recentMessages[existingIndex].unreadCount + 1 : 1) 
        : 0
    };
    
    if (existingIndex >= 0) {
      // Update existing entry
      user.recentMessages[existingIndex] = recentMessageEntry;
    } else {
      // Add new entry
      user.recentMessages.push(recentMessageEntry);
    }
    
    await user.save();
    return true;
  } catch (error) {
    console.error("Error updating user recent messages:", error);
    return false;
  }
};

// Mark messages from a specific chat session as read
export const markMessagesAsRead = async (req, res) => {
  try {
    const { chatSessionId } = req.params;
    const userId = req.user._id;
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    // Find the chat session in recentMessages
    const messageIndex = user.recentMessages.findIndex(
      item => item.chatSessionId.toString() === chatSessionId
    );
    
    if (messageIndex >= 0) {
      // Reset unread count to zero
      user.recentMessages[messageIndex].unreadCount = 0;
      await user.save();
    }
    
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error in markMessagesAsRead:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

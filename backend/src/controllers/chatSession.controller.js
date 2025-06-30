import ChatSession from "../models/chatSession.model.js";
import User from "../models/user.model.js";
import { io } from "../lib/socket.js";
import { getReceiverSocketId } from "../lib/socket.js";

// Create or get a chat session between two users
export const getOrCreateChatSession = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id;

    // Don't allow chat with self
    if (userId === currentUserId.toString()) {
      return res.status(400).json({ error: "Cannot create chat with yourself" });
    }

    // Check if user exists
    const otherUser = await User.findById(userId);
    if (!otherUser) {
      return res.status(404).json({ error: "User not found" });
    }

    // Look for existing chat session between these users
    // We need to check both possible orders of participants
    let chatSession = await ChatSession.findOne({
      participants: { $all: [currentUserId, userId] }
    }).populate("participants", "fullName profilePic");

    // If no chat session exists, create one
    if (!chatSession) {
      chatSession = await ChatSession.create({
        participants: [currentUserId, userId],
        messages: []
      });

      // Populate the participants after creation
      chatSession = await ChatSession.findById(chatSession._id).populate("participants", "fullName profilePic");

      // Add to both users' active chats
      await User.findByIdAndUpdate(
        currentUserId,
        { $addToSet: { activeChats: userId } }
      );

      await User.findByIdAndUpdate(
        userId,
        { $addToSet: { activeChats: currentUserId } }
      );
    }

    res.status(200).json(chatSession);
  } catch (error) {
    console.error("Error in getOrCreateChatSession:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get all chat sessions for the current user
export const getUserChatSessions = async (req, res) => {
  try {
    const currentUserId = req.user._id;

    // Find all chat sessions where the current user is a participant
    const chatSessions = await ChatSession.find({
      participants: currentUserId
    })
      .populate("participants", "fullName profilePic")
      .populate("lastMessage.sender", "fullName")
      .sort({ updatedAt: -1 }); // Sort by most recent activity

    res.status(200).json(chatSessions);
  } catch (error) {
    console.error("Error in getUserChatSessions:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Send a message in a chat session
export const sendMessage = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { text, image } = req.body;
    const senderId = req.user._id;

    if (!text && !image) {
      return res.status(400).json({ error: "Message cannot be empty" });
    }

    // Find the chat session
    const chatSession = await ChatSession.findById(sessionId);
    if (!chatSession) {
      return res.status(404).json({ error: "Chat session not found" });
    }

    // Verify sender is a participant
    if (!chatSession.participants.includes(senderId)) {
      return res.status(403).json({ error: "Not authorized to send messages in this chat" });
    }

    // Create the new message
    const newMessage = {
      sender: senderId,
      text,
      image,
      createdAt: new Date()
    };

    // Add message to chat session
    chatSession.messages.push(newMessage);
    
    // Update last message
    chatSession.lastMessage = {
      text,
      image,
      sender: senderId,
      createdAt: new Date()
    };

    await chatSession.save();

    // Find the other participant to notify
    const receiverId = chatSession.participants.find(
      (participantId) => participantId.toString() !== senderId.toString()
    );

    // Get socket of the receiver and emit event
    if (receiverId) {
      const receiverSocketId = getReceiverSocketId(receiverId.toString());
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("newMessage", {
          chatSessionId: chatSession._id,
          message: newMessage
        });
      }
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.error("Error in sendMessage:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get messages for a specific chat session
export const getChatSessionMessages = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user._id;

    // Find the chat session and verify user is a participant
    const chatSession = await ChatSession.findOne({
      _id: sessionId,
      participants: userId
    }).populate({
      path: "messages.sender",
      select: "fullName profilePic"
    });

    if (!chatSession) {
      return res.status(404).json({ error: "Chat session not found or you're not a participant" });
    }

    res.status(200).json(chatSession.messages);
  } catch (error) {
    console.error("Error in getChatSessionMessages:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Create a random chat match
export const createRandomChatMatch = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    
    // Find current user
    const currentUser = await User.findById(currentUserId);
    
    // Exclude current user, friends, and active chats from potential matches
    const excludeIds = [
      currentUserId, 
      ...currentUser.friends,
      ...currentUser.activeChats
    ];
    
    // Find users not in the exclude list
    const potentialMatches = await User.find({
      _id: { $nin: excludeIds }
    }).select("-password");
    
    if (potentialMatches.length === 0) {
      return res.status(404).json({ error: "No users available for matching" });
    }
    
    // Select a random user from potential matches
    const randomIndex = Math.floor(Math.random() * potentialMatches.length);
    const randomUser = potentialMatches[randomIndex];
    
    // Create a new chat session between these users
    const chatSession = await ChatSession.create({
      participants: [currentUserId, randomUser._id],
      messages: []
    });
    
    // Add to both users' active chats
    await User.findByIdAndUpdate(
      currentUserId,
      { $addToSet: { activeChats: randomUser._id } }
    );
    
    await User.findByIdAndUpdate(
      randomUser._id,
      { $addToSet: { activeChats: currentUserId } }
    );
    
    // Return the matched user and chat session
    const populatedSession = await ChatSession.findById(chatSession._id)
      .populate("participants", "fullName profilePic");
    
    // Find the other user in the participants array
    const matchedUser = populatedSession.participants.find(
      user => user._id.toString() !== currentUserId.toString()
    );
    
    res.status(200).json({
      user: matchedUser,
      chatSessionId: chatSession._id
    });
  } catch (error) {
    console.error("Error in createRandomChatMatch:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

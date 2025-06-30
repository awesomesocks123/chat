import ChatSession from "../models/chatSession.model.js";
import User from "../models/user.model.js";
import { io } from "../lib/socket.js";
import { getReceiverSocketId } from "../lib/socket.js";
import { updateUserRecentMessage } from "./user.controller.js";

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

    // Create the new message with proper sender ID as ObjectId
    const newMessage = {
      sender: senderId,
      text,
      image,
      createdAt: new Date()
    };

    // Add message to chat session
    chatSession.messages.push(newMessage);
    
    // Update last message with proper sender ID
    chatSession.lastMessage = {
      text,
      image,
      sender: senderId,
      createdAt: new Date()
    };
    
    // Update the updatedAt timestamp to ensure proper sorting
    chatSession.updatedAt = new Date();

    await chatSession.save();

    // Find the other participant to notify
    const otherUserId = chatSession.participants.find(
      (participantId) => participantId.toString() !== senderId.toString()
    );

    // Define receiverId from otherUserId
    const receiverId = otherUserId;

    // Ensure the message has explicit sender information for socket emission
    const messageWithExplicitSender = {
      ...newMessage,
      sender: senderId,  // Make sure sender ID is explicitly included
      senderId: senderId // Include for backward compatibility
    };

    // Update recent messages for both users (sender and receiver)
    await Promise.all([
      // Update sender's recent messages
      updateUserRecentMessage(
        senderId, 
        chatSession._id, 
        receiverId, 
        newMessage
      ),
      
      // Update receiver's recent messages
      updateUserRecentMessage(
        receiverId, 
        chatSession._id, 
        senderId, 
        newMessage
      )
    ]);

    // Get socket of the receiver and emit event
    if (otherUserId) {
      const receiverSocketId = getReceiverSocketId(otherUserId.toString());
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("newMessage", {
          chatSessionId: chatSession._id,
          message: messageWithExplicitSender
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
    });

    if (!chatSession) {
      return res.status(404).json({ error: "Chat session not found or you're not a participant" });
    }
    
    // Process messages to ensure proper sender information
    const processedMessages = chatSession.messages.map(message => {
      // Create a new object to avoid modifying the original
      const processedMessage = {
        ...message.toObject(),
        // Explicitly mark if the current user is the sender
        isSentByMe: message.sender.toString() === userId.toString()
      };
      
      return processedMessage;
    });

    console.log(`Returning ${processedMessages.length} messages for session ${sessionId}`);
    res.status(200).json(processedMessages);
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
    
    // Only exclude current user and friends (not active chats)
    // This allows repeated random matching with the same users
    const excludeIds = [
      currentUserId, 
      ...currentUser.friends
      // Removed activeChats to allow re-matching with previous random matches
    ];
    
    console.log(`Finding random match for user ${currentUserId}. Excluding ${excludeIds.length} users.`);
    
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
    
    // Create a new chat session
    const newChatSession = await ChatSession.create({
      participants: [currentUserId, randomUser._id],
      messages: []
    });
    
    // Add to both users' active chats and initialize recent messages
    const emptyMessage = {
      text: "",
      image: "",
      sender: null,
      createdAt: new Date()
    };
    
    // Initialize recent messages for current user
    await User.findByIdAndUpdate(currentUserId, {
      $addToSet: { activeChats: randomUser._id },
      $push: {
        recentMessages: {
          chatSessionId: newChatSession._id,
          otherUser: randomUser._id,
          lastMessage: emptyMessage,
          unreadCount: 0
        }
      }
    });
    
    // Initialize recent messages for the matched user
    await User.findByIdAndUpdate(randomUser._id, {
      $addToSet: { activeChats: currentUserId },
      $push: {
        recentMessages: {
          chatSessionId: newChatSession._id,
          otherUser: currentUserId,
          lastMessage: emptyMessage,
          unreadCount: 0
        }
      }
    });
    
    // Return the matched user and chat session
    const populatedSession = await ChatSession.findById(newChatSession._id)
      .populate("participants", "fullName profilePic");
    
    // Find the other user in the participants array
    const matchedUser = populatedSession.participants.find(
      user => user._id.toString() !== currentUserId.toString()
    );
    
    // Find the current user for the notification
    const currentUserInfo = populatedSession.participants.find(
      user => user._id.toString() === currentUserId.toString()
    );
    
    // Notify the other user about the new chat session
    const receiverSocketId = getReceiverSocketId(randomUser._id.toString());
    if (receiverSocketId) {
      console.log(`Notifying user ${randomUser._id} about new random match`);
      io.to(receiverSocketId).emit("newChatSession", {
        user: currentUserInfo,
        chatSession: populatedSession
      });
    }
    
    res.status(200).json({
      user: matchedUser,
      chatSessionId: newChatSession._id
    });
  } catch (error) {
    console.error("Error in createRandomChatMatch:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

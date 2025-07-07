import User from "../models/user.model.js";
import { getSocketIO } from "../socket/socket.js";

// Send a friend request to another user
export const sendFriendRequest = async (req, res) => {
  try {
    const { userId } = req.body;
    const currentUserId = req.user._id;

    // Don't allow sending request to yourself
    if (userId === currentUserId.toString()) {
      return res.status(400).json({ error: "You cannot send a friend request to yourself" });
    }

    // Check if user exists
    const userToAdd = await User.findById(userId);
    if (!userToAdd) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if already friends
    const currentUser = await User.findById(currentUserId);
    if (currentUser.friends.includes(userId)) {
      return res.status(400).json({ error: "User is already in your friends list" });
    }
    
    // Check if request already sent
    if (currentUser.friendRequests.sent.includes(userId)) {
      return res.status(400).json({ error: "Friend request already sent" });
    }
    
    // Check if there's a pending request from this user
    if (currentUser.friendRequests.received.includes(userId)) {
      return res.status(400).json({ error: "This user has already sent you a friend request. Check your notifications to accept it." });
    }

    // Add to sent requests for current user
    await User.findByIdAndUpdate(
      currentUserId,
      { $addToSet: { "friendRequests.sent": userId } }
    );

    // Add to received requests for the other user
    await User.findByIdAndUpdate(
      userId,
      { $addToSet: { "friendRequests.received": currentUserId } }
    );

    // Get socket.io instance and emit event to the recipient
    const io = getSocketIO();
    if (io) {
      // Get sender details to include in notification
      const sender = await User.findById(currentUserId, "fullName username profilePic");
      
      // Emit to specific user
      io.to(userId).emit("friendRequest", {
        type: "received",
        user: sender
      });
    }

    res.status(200).json({ message: "Friend request sent successfully" });
  } catch (error) {
    console.error("Error sending friend request:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Accept a friend request
export const acceptFriendRequest = async (req, res) => {
  try {
    const { userId } = req.body;
    const currentUserId = req.user._id;

    // Check if user exists
    const userToAccept = await User.findById(userId);
    if (!userToAccept) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if there's a pending request from this user
    const currentUser = await User.findById(currentUserId);
    if (!currentUser.friendRequests.received.includes(userId)) {
      return res.status(400).json({ error: "No friend request from this user" });
    }

    // Add to friends list for both users
    await User.findByIdAndUpdate(
      currentUserId,
      { 
        $addToSet: { friends: userId, activeChats: userId },
        $pull: { "friendRequests.received": userId }
      }
    );

    await User.findByIdAndUpdate(
      userId,
      { 
        $addToSet: { friends: currentUserId, activeChats: currentUserId },
        $pull: { "friendRequests.sent": currentUserId }
      }
    );

    // Get socket.io instance and emit events to both users
    const io = getSocketIO();
    if (io) {
      // Get both users' details
      const acceptingUser = await User.findById(currentUserId, "fullName username profilePic");
      const requestingUser = await User.findById(userId, "fullName username profilePic");
      
      // Notify the user who sent the request that it was accepted
      io.to(userId).emit("friendRequestAccepted", {
        user: acceptingUser
      });
      
      // Also notify the accepting user (for UI updates)
      io.to(currentUserId.toString()).emit("friendRequestAccepted", {
        user: requestingUser
      });
    }

    res.status(200).json({ message: "Friend request accepted" });
  } catch (error) {
    console.error("Error accepting friend request:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Decline a friend request
export const declineFriendRequest = async (req, res) => {
  try {
    const { userId } = req.body;
    const currentUserId = req.user._id;

    // Remove from received requests
    await User.findByIdAndUpdate(
      currentUserId,
      { $pull: { "friendRequests.received": userId } }
    );

    // Remove from sent requests of the other user
    await User.findByIdAndUpdate(
      userId,
      { $pull: { "friendRequests.sent": currentUserId } }
    );

    // Get socket.io instance and emit event to the sender
    const io = getSocketIO();
    if (io) {
      // Notify the user who sent the request that it was declined
      io.to(userId).emit("friendRequestDeclined", {
        userId: currentUserId
      });
    }

    res.status(200).json({ message: "Friend request declined" });
  } catch (error) {
    console.error("Error declining friend request:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Cancel a sent friend request
export const cancelFriendRequest = async (req, res) => {
  try {
    const { userId } = req.body;
    const currentUserId = req.user._id;

    // Remove from sent requests
    await User.findByIdAndUpdate(
      currentUserId,
      { $pull: { "friendRequests.sent": userId } }
    );

    // Remove from received requests of the other user
    await User.findByIdAndUpdate(
      userId,
      { $pull: { "friendRequests.received": currentUserId } }
    );

    // Get socket.io instance and emit event to the recipient
    const io = getSocketIO();
    if (io) {
      // Notify the recipient that the request was cancelled
      io.to(userId).emit("friendRequestCancelled", {
        userId: currentUserId
      });
    }

    res.status(200).json({ message: "Friend request cancelled" });
  } catch (error) {
    console.error("Error cancelling friend request:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Remove a user from friends list
export const removeFriend = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id;

    await User.findByIdAndUpdate(
      currentUserId,
      { $pull: { friends: userId } }
    );

    res.status(200).json({ message: "Friend removed successfully" });
  } catch (error) {
    console.error("Error removing friend:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get random user for chat
export const getRandomUser = async (req, res) => {
  try {
    console.log("Backend: Getting random user...");
    const currentUserId = req.user._id;
    console.log("Backend: Current user ID:", currentUserId);
    
    // Find a random user that is not the current user and not already in friends list
    const currentUser = await User.findById(currentUserId);
    console.log("Backend: Current user:", {
      id: currentUser._id,
      name: currentUser.fullName,
      friends: currentUser.friends.length,
      activeChats: currentUser.activeChats.length
    });
    
    // Exclude current user and friends from potential matches
    const excludeIds = [currentUserId, ...currentUser.friends];
    console.log("Backend: Excluding IDs:", excludeIds);
    
    // Find users not in the exclude list
    const potentialMatches = await User.find({
      _id: { $nin: excludeIds }
    }).select("-password");
    
    console.log("Backend: Found potential matches:", potentialMatches.length);
    
    if (potentialMatches.length === 0) {
      console.log("Backend: No users available for matching");
      return res.status(404).json({ error: "No users available for matching" });
    }
    
    // Select a random user from potential matches
    const randomIndex = Math.floor(Math.random() * potentialMatches.length);
    const randomUser = potentialMatches[randomIndex];
    
    console.log("Backend: Selected random user:", {
      id: randomUser._id,
      name: randomUser.fullName,
      email: randomUser.email
    });
    
    // Add to current user's active chats
    await User.findByIdAndUpdate(
      currentUserId,
      { $addToSet: { activeChats: randomUser._id } }
    );
    
    // IMPORTANT: Also add current user to the random user's active chats (bidirectional)
    await User.findByIdAndUpdate(
      randomUser._id,
      { $addToSet: { activeChats: currentUserId } }
    );
    
    console.log("Backend: Added to both users' active chats");
    
    res.status(200).json(randomUser);
  } catch (error) {
    console.error("Error getting random user:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get friends list
export const getFriends = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    
    const user = await User.findById(currentUserId)
      .populate("friends", "-password")
      .lean();
    
    res.status(200).json(user.friends);
  } catch (error) {
    console.error("Error getting friends:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get received friend requests
export const getReceivedFriendRequests = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    
    const user = await User.findById(currentUserId)
      .populate("friendRequests.received", "fullName username profilePic email")
      .lean();
    
    res.status(200).json(user.friendRequests.received);
  } catch (error) {
    console.error("Error getting received friend requests:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get sent friend requests
export const getSentFriendRequests = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    
    const user = await User.findById(currentUserId)
      .populate("friendRequests.sent", "fullName username profilePic email")
      .lean();
    
    res.status(200).json(user.friendRequests.sent);
  } catch (error) {
    console.error("Error getting sent friend requests:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get active chats
export const getActiveChats = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    
    const user = await User.findById(currentUserId)
      .populate("activeChats", "-password")
      .lean();
    
    res.status(200).json(user.activeChats);
  } catch (error) {
    console.error("Error getting active chats:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

import User from "../models/user.model.js";

// Add a user to friends list
export const addFriend = async (req, res) => {
  try {
    const { userId } = req.body;
    const currentUserId = req.user._id;

    // Don't allow adding yourself as a friend
    if (userId === currentUserId.toString()) {
      return res.status(400).json({ error: "You cannot add yourself as a friend" });
    }

    // Check if user exists
    const friendToAdd = await User.findById(userId);
    if (!friendToAdd) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if already friends
    const currentUser = await User.findById(currentUserId);
    if (currentUser.friends.includes(userId)) {
      return res.status(400).json({ error: "User is already in your friends list" });
    }

    // Add to friends list
    await User.findByIdAndUpdate(
      currentUserId,
      { $push: { friends: userId } }
    );

    // Also add to active chats if not already there
    if (!currentUser.activeChats.includes(userId)) {
      await User.findByIdAndUpdate(
        currentUserId,
        { $push: { activeChats: userId } }
      );
    }

    res.status(200).json({ message: "Friend added successfully" });
  } catch (error) {
    console.error("Error adding friend:", error.message);
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

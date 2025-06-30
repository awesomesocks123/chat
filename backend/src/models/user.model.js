import mongoose from "mongoose";

// Schema for recent messages stored in the user document
const recentMessageSchema = new mongoose.Schema(
  {
    chatSessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ChatSession",
      required: true
    },
    otherUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    lastMessage: {
      text: String,
      image: String,
      sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    },
    unreadCount: {
      type: Number,
      default: 0
    }
  },
  { _id: false } // Don't create an _id for this subdocument
);

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    profilePic: {
      type: String,
      default: "",
    },
    friends: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
      default: [],
    },
    activeChats: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
      default: [],
    },
    // Add recentMessages array for the hybrid approach
    recentMessages: {
      type: [recentMessageSchema],
      default: []
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;

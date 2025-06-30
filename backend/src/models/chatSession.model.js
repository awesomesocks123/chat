import mongoose from "mongoose";

const chatSessionSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
      }
    ],
    messages: [
      {
        sender: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true
        },
        text: {
          type: String
        },
        image: {
          type: String
        },
        createdAt: {
          type: Date,
          default: Date.now
        }
      }
    ],
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
    }
  },
  { timestamps: true }
);

// Create a compound index on participants to make lookups faster
chatSessionSchema.index({ participants: 1 });

const ChatSession = mongoose.model("ChatSession", chatSessionSchema);

export default ChatSession;

import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    // Use sender instead of senderId for consistency
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Optional receiver for direct messages
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    // Optional roomId for public room messages
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PublicRoom",
    },
    // Optional chatSessionId for private chat sessions
    chatSessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ChatSession",
    },
    text: {
      type: String,
    },
    image: {
      type: String,
    },
    // Add read status for unread message counts
    read: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Ensure either receiver, roomId, or chatSessionId is provided
messageSchema.pre('validate', function(next) {
  if (!this.receiver && !this.roomId && !this.chatSessionId) {
    return next(new Error('A message must have either a receiver, roomId, or chatSessionId'));
  }
  next();
});

const Message = mongoose.model("Message", messageSchema);

export default Message;

import mongoose from "mongoose";

const blockedUserSchema = new mongoose.Schema(
  {
    blocker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    blocked: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    reason: {
      type: String,
      default: ""
    }
  },
  { timestamps: true }
);

// Compound index to ensure a user can only block another user once
blockedUserSchema.index({ blocker: 1, blocked: 1 }, { unique: true });

const BlockedUser = mongoose.model("BlockedUser", blockedUserSchema);

export default BlockedUser;

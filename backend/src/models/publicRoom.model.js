import mongoose from "mongoose";

const publicRoomSchema = new mongoose.Schema(
  {
    name: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,
        required: true, 
    },
    category: {
        type: String,
        required: true,
        enum: ["Gaming", "Music", "Movie", "TV Show"],
    },
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
                type: String,
            },
            image: {
                type: String,
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
    },
    isPublic: {
        type: Boolean,
        default: true
    }
  },
  { timestamps: true }
);

const PublicRoom = mongoose.model("PublicRoom", publicRoomSchema);

export default PublicRoom;

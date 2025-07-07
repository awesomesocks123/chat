import mongoose from "mongoose";

// Function to generate random username
const generateRandomUsername = () => {
  const adjectives = ["Funny", "Silly", "Goofy", "Smiling", "Excited",
    "Amazing", "Great", "Happy", "Adventurous", "Lighthearted", "Wild", "Quiet", "Loud", "Soft",
    "Loud", "Calm", "Empathetic", "Serene", "Joyful", "Jolly", "Merry", "Cheerful", "Gleeful",
    "Carefree", "Blissful", "Optimistic", "Shining", "Sunny", "Radiant", "Bright", "Luminous",
    "Nice"];
  const animals = ["Monkey", "Dog", "Cat", "Bird", "Fish", "Tiger", "Lion", "Bear", "Elephant",
    "Horse", "Squirrel", "Rabbit", "Kangaroo", "Koala", "Panda", "Giraffe", "Zebra", "Rhino",
    "Starfish", "Crab", "Flower", "Rose", "Daisy", "Sunflower", "Tulip", "Lily", "Daffodil",
    "Orchid", "Iris", "Poppy", "Carnation", "Peony", "Dahlia", "Hyacinth", "Lavender", "Lilac",
    "Star", "Moon", "Sun", "Planet", "Galaxy", "Universe", "Asteroid", "Meteor", "Comet", "Nebula"];
  const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const randomAnimal = animals[Math.floor(Math.random() * animals.length)];
  const randomNum = Math.floor(Math.random() * (100 - 0 + 1) + 0);
  return `${randomAdjective} ${randomAnimal} #${randomNum}`;
};

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
    username: {
      type: String,
      default: generateRandomUsername,
      unique: true,
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
    friendRequests: {
      // Friend requests received by this user
      received: {
        type: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
        default: [],
      },
      // Friend requests sent by this user
      sent: {
        type: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
        default: [],
      },
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

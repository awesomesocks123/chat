// scripts/createDefaultRooms.js
import mongoose from "mongoose";
import PublicRoom from "../models/publicRoom.model.js";
import dotenv from "dotenv";

dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => console.error("MongoDB connection error:", err));

// Default rooms to create
const defaultRooms = [
  // 🎮 GAMING
  {
    name: "PC & Console Gamers",
    description: "Discuss AAA titles, latest game releases, cross-platform debates, and setup flexing.",
    category: "Gaming",
  },
  {
    name: "Tabletop Tavern",
    description: "Board games, DnD sessions, Magic the Gathering, and analog gaming nights.",
    category: "Gaming",
  },
  {
    name: "LFG Matchmaking",
    description: "Find teammates, party up for raids, scrims, co-op missions, and late-night queues.",
    category: "Gaming",
  },

  // 🎵 MUSIC
  {
    name: "Music Hub",
    description: "Share tracks, discover new genres, and vibe with fellow music lovers.",
    category: "Music",
  },
  {
    name: "Hip-Hop Heads",
    description: "Talk bars, beefs, new drops, classic albums, and regional rap scenes.",
    category: "Music",
  },
  {
    name: "Chill & Classical",
    description: "Lo-fi, classical, ambient, instrumental — music to think, study, or zone out to.",
    category: "Music",
  },

  // 🎬 MOVIES
  {
    name: "Movie Buffs",
    description: "From blockbusters to indies, share hot takes and hidden gems.",
    category: "Movie",
  },
  {
    name: "A24 & Artsy Vibes",
    description: "For the lovers of cinematography, storytelling, and emotionally devastating endings.",
    category: "Movie",
  },
  {
    name: "Marvel vs DC",
    description: "Hot takes, trailer drops, release news, and comic-to-screen discussions.",
    category: "Movie",
  },

  // 🌐 RANDOM
  {
    name: "Late Night Talks",
    description: "Unfiltered chats, shower thoughts, 2AM confessions, and random chaos.",
    category: "Random",
  },
  {
    name: "Hot Takes Only",
    description: "Come here to debate — no opinions too bold. Keep it spicy but respectful.",
    category: "Random",
  },
  {
    name: "Memes & Mayhem",
    description: "Dump your memes, TikToks, cursed content, or wholesome chaos.",
    category: "Random",
  }
];

// Create the default rooms
const createRooms = async () => {
  try {
    // Check if rooms already exist
    const existingRooms = await PublicRoom.find({
      name: { $in: defaultRooms.map(room => room.name) }
    });

    if (existingRooms.length > 0) {
      console.log(`${existingRooms.length} rooms already exist. Skipping creation.`);

      // Create only missing rooms
      const existingRoomNames = existingRooms.map(room => room.name);
      const roomsToCreate = defaultRooms.filter(room => !existingRoomNames.includes(room.name));

      if (roomsToCreate.length > 0) {
        await PublicRoom.insertMany(roomsToCreate);
        console.log(`Created ${roomsToCreate.length} new rooms.`);
      }
    } else {
      // Create all rooms
      await PublicRoom.insertMany(defaultRooms);
      console.log(`Created ${defaultRooms.length} default rooms.`);
    }

    process.exit(0);
  } catch (error) {
    console.error("Error creating default rooms:", error);
    process.exit(1);
  }
};

createRooms();
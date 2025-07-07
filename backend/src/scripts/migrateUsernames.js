import mongoose from "mongoose";
import User from "../models/user.model.js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Setup environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

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

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

// Main migration function
const migrateUsernames = async () => {
  try {
    const conn = await connectDB();
    console.log("Starting username migration...");
    
    // Find all users without a username
    const users = await User.find({ username: { $exists: false } });
    console.log(`Found ${users.length} users to migrate`);
    
    // Generate and assign usernames to each user
    for (const user of users) {
      let username = generateRandomUsername();
      let isUnique = false;
      
      // Ensure username is unique
      while (!isUnique) {
        const existingUser = await User.findOne({ username });
        if (!existingUser) {
          isUnique = true;
        } else {
          username = generateRandomUsername();
        }
      }
      
      user.username = username;
      await user.save();
      console.log(`Assigned username "${username}" to user ${user.fullName}`);
    }
    
    console.log("Username migration completed successfully");
    await conn.disconnect();
    process.exit(0);
  } catch (error) {
    console.error(`Migration error: ${error.message}`);
    process.exit(1);
  }
};

// Run the migration
migrateUsernames();

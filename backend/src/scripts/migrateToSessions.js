import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Message from '../models/message.model.js';
import ChatSession from '../models/chatSession.model.js';
import User from '../models/user.model.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB for migration'))
  .catch(err => {
    console.error('Failed to connect to MongoDB:', err);
    process.exit(1);
  });

const migrateMessages = async () => {
  try {
    console.log('Starting migration of messages to chat sessions...');
    
    // Get all messages
    const messages = await Message.find({}).sort({ createdAt: 1 });
    console.log(`Found ${messages.length} messages to migrate`);
    
    // Track unique conversation pairs
    const conversationPairs = new Map();
    
    // Group messages by conversation pairs
    for (const message of messages) {
      const senderId = message.senderId.toString();
      const receiverId = message.receiverId.toString();
      
      // Create a unique key for each conversation pair (sorted to ensure consistency)
      const pairKey = [senderId, receiverId].sort().join('-');
      
      if (!conversationPairs.has(pairKey)) {
        conversationPairs.set(pairKey, []);
      }
      
      conversationPairs.get(pairKey).push(message);
    }
    
    console.log(`Found ${conversationPairs.size} unique conversation pairs`);
    
    // Create chat sessions for each conversation pair
    for (const [pairKey, pairMessages] of conversationPairs.entries()) {
      const [user1Id, user2Id] = pairKey.split('-');
      
      // Get user objects
      const user1 = await User.findById(user1Id);
      const user2 = await User.findById(user2Id);
      
      if (!user1 || !user2) {
        console.warn(`Skipping conversation pair ${pairKey} - one or both users not found`);
        continue;
      }
      
      // Create a new chat session
      const chatSession = new ChatSession({
        participants: [user1Id, user2Id],
        messages: pairMessages.map(msg => ({
          sender: msg.senderId,
          text: msg.text,
          image: msg.image,
          createdAt: msg.createdAt,
          updatedAt: msg.updatedAt
        })),
        lastMessage: {
          sender: pairMessages[pairMessages.length - 1].senderId,
          text: pairMessages[pairMessages.length - 1].text,
          image: pairMessages[pairMessages.length - 1].image,
          createdAt: pairMessages[pairMessages.length - 1].createdAt
        }
      });
      
      await chatSession.save();
      console.log(`Created chat session for ${user1.fullName} and ${user2.fullName} with ${pairMessages.length} messages`);
      
      // Update users' active chats if they don't already have each other
      if (!user1.activeChats.includes(user2Id)) {
        await User.findByIdAndUpdate(user1Id, { $addToSet: { activeChats: user2Id } });
      }
      
      if (!user2.activeChats.includes(user1Id)) {
        await User.findByIdAndUpdate(user2Id, { $addToSet: { activeChats: user1Id } });
      }
    }
    
    console.log('Migration completed successfully!');
    console.log('Note: Original messages are preserved. You can delete them manually after verifying the migration.');
    
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run the migration
migrateMessages();

import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    // Try to connect to the configured MongoDB URI
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.log("MongoDB Atlas connection error:", error);
    
    // If Atlas connection fails, try connecting to local MongoDB
    try {
      console.log("Attempting to connect to local MongoDB...");
      const localConn = await mongoose.connect('mongodb://127.0.0.1:27017/chat_app');
      console.log(`Connected to local MongoDB: ${localConn.connection.host}`);
    } catch (localError) {
      console.log("Local MongoDB connection error:", localError);
      console.log("Could not connect to any MongoDB instance. The application may not function correctly.");
    }
  }
};

import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

// MongoDB Connection with better error handling
const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.error("❌ MONGO_URI is not set in .env file!");
      console.log("Please add MONGO_URI to your Server/.env file");
      process.exit(1);
    }

    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
  } catch (err) {
    console.error("❌ MongoDB Connection Error:", err.message);
    console.log("\n💡 Troubleshooting tips:");
    console.log("1. If using local MongoDB, make sure MongoDB service is running");
    console.log("2. Check your MONGO_URI in Server/.env file");
    console.log("3. For local MongoDB, try: mongodb://localhost:27017/finwise");
    console.log("4. Or use MongoDB Atlas (cloud) for easier setup\n");
    // Don't exit - let the server start but operations will fail gracefully
  }
};

export default connectDB;



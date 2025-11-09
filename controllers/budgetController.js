import Transaction from "../models/Transaction.js";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/constants.js";

// Helper function to calculate rounded amount
const calculateRounded = (amount, roundingType) => {
  if (roundingType === "nearest-decimal") return Math.ceil(amount * 10) / 10;
  if (roundingType === "nearest-tens") return Math.ceil(amount / 10) * 10;
  if (roundingType === "nearest-hundreds") return Math.ceil(amount / 100) * 100;
  return amount;
};

// Helper to extract userId from token
const getUserIdFromToken = (req) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      return decoded.userId?.toString();
    } catch (err) {
      return null;
    }
  }
  return null;
};

// GET /api/budget/total-savings → Get total savings for authenticated user
export const getTotalSavings = async (req, res) => {
  try {
    const userId = getUserIdFromToken(req);
    
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: No valid token" });
    }

    // Check MongoDB connection
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ message: "Database not connected" });
    }

    const transactions = await Transaction.find({ userId });

    let totalSavings = 0;
    for (const t of transactions) {
      const rounded = calculateRounded(t.amount, t.roundingType);
      totalSavings += rounded - t.amount;
    }

    res.json({ totalSavings: Number(totalSavings.toFixed(2)) });
  } catch (error) {
    console.error("Error calculating total savings:", error);
    res.status(500).json({ message: "Server error while calculating savings", error: error.message });
  }
};



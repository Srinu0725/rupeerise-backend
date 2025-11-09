import Transaction from "../models/Transaction.js";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/constants.js";

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

// POST /api/transactions → Add new transaction for authenticated user
export const createTransaction = async (req, res) => {
  try {
    const userId = getUserIdFromToken(req);
    
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: No valid token" });
    }

    const { amount, date, roundingType } = req.body;

    // Validation
    if (!amount || !roundingType) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Check MongoDB connection
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ message: "Database not connected" });
    }

    const newTransaction = new Transaction({
      userId,
      amount,
      date: date ? new Date(date) : new Date(),
      roundingType,
    });

    await newTransaction.save();
    res.status(201).json(newTransaction);
  } catch (error) {
    console.error("Error saving transaction:", error);
    res.status(500).json({ message: "Server error while saving transaction", error: error.message });
  }
};

// GET /api/transactions → Get all transactions for authenticated user
export const getTransactions = async (req, res) => {
  try {
    const userId = getUserIdFromToken(req);
    
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: No valid token" });
    }

    // Check MongoDB connection
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ message: "Database not connected" });
    }

    // Sort by date ascending (oldest first)
    const transactions = await Transaction.find({ userId }).sort({ date: 1 });
    res.json(transactions);
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({ message: "Server error while fetching transactions", error: error.message });
  }
};



import MicroInvestment from "../models/MicroInvestment.js";
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

// Helper to compute total budget savings
const computeUserTotalSavings = async (userId) => {
  const transactions = await Transaction.find({ userId });
  let total = 0;
  for (const tx of transactions) {
    const rounded = calculateRounded(tx.amount, tx.roundingType);
    total += (rounded - tx.amount);
  }
  return total;
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

// GET /api/microinvestment → Get all micro investment allocations for authenticated user
export const getMicroInvestments = async (req, res) => {
  try {
    const userId = getUserIdFromToken(req);
    
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: No valid token" });
    }

    // Check MongoDB connection
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ message: "Database not connected" });
    }

    const allocations = await MicroInvestment.find({ userId });
    res.json(allocations);
  } catch (error) {
    console.error("Error fetching microinvestment data:", error);
    res.status(500).json({ message: "Server error while fetching microinvestment data", error: error.message });
  }
};

// POST /api/microinvestment → Add a new allocation for authenticated user
export const createMicroInvestment = async (req, res) => {
  try {
    const userId = getUserIdFromToken(req);
    
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: No valid token" });
    }

    let { category, amount, description } = req.body;

    if (!category || !amount) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    amount = parseFloat(amount);
    if (isNaN(amount) || amount <= 0) {
      return res.status(400).json({ error: "Invalid amount" });
    }

    // Check MongoDB connection
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ message: "Database not connected" });
    }

    // 1) total savings from budget
    const totalBudgetSavings = await computeUserTotalSavings(userId);
    
    // 2) sum of existing allocations
    const existingAllocations = await MicroInvestment.find({ userId });
    const allocatedSoFar = existingAllocations.reduce((sum, a) => sum + a.amount, 0);
    
    // 3) unallocated
    const unallocated = totalBudgetSavings - allocatedSoFar;
    
    if (amount > unallocated) {
      return res.status(400).json({ error: "Cannot allocate more than unallocated" });
    }

    // 4) Create new allocation (include description)
    const newAlloc = new MicroInvestment({ userId, category, amount, description });
    await newAlloc.save();
    res.json(newAlloc);
  } catch (error) {
    console.error("Error in POST /api/microinvestment:", error);
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
};

// DELETE /api/microinvestment/:id → Remove an allocation
export const deleteMicroInvestment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = getUserIdFromToken(req);
    
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: No valid token" });
    }

    // Check MongoDB connection
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ message: "Database not connected" });
    }

    // First, find the allocation and verify it belongs to the user
    const allocation = await MicroInvestment.findById(id);
    if (!allocation) {
      return res.status(404).json({ error: "Allocation not found" });
    }

    // Verify userId matches - ensure user can only delete their own allocations
    if (allocation.userId !== userId) {
      return res.status(403).json({ error: "Unauthorized: This allocation does not belong to the specified user" });
    }

    // Delete the allocation
    await MicroInvestment.findByIdAndDelete(id);
    res.json({ message: "Allocation deleted" });
  } catch (error) {
    console.error("Error in DELETE /api/microinvestment/:id:", error);
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
};



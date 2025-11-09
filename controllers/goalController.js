import Goal from "../models/Goal.js";
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

/**
 * @route   GET /api/goals
 * @desc    Get goal data for the authenticated user
 */
export const getGoal = async (req, res) => {
  try {
    const userId = getUserIdFromToken(req);
    
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: No valid token" });
    }

    // Check MongoDB connection
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ message: "Database not connected" });
    }

    let goal = await Goal.findOne({ userId });

    // If no goal found, create a new default one
    if (!goal) {
      goal = new Goal({ userId });
      await goal.save();
    }

    res.status(200).json(goal);
  } catch (error) {
    console.error("Error fetching goal:", error);
    res.status(500).json({ message: "Server error while fetching goal", error: error.message });
  }
};

/**
 * @route   POST /api/goals
 * @desc    Update or set monthly goals (savings & expenditure) for authenticated user
 */
export const updateGoals = async (req, res) => {
  try {
    const userId = getUserIdFromToken(req);
    
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: No valid token" });
    }

    const { expenditureGoal, savingsGoal } = req.body;

    // Check MongoDB connection
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ message: "Database not connected" });
    }

    let goal = await Goal.findOne({ userId });
    
    if (!goal) {
      goal = new Goal({ userId, expenditureGoal, savingsGoal });
    } else {
      goal.expenditureGoal = expenditureGoal;
      goal.savingsGoal = savingsGoal;
    }
    
    await goal.save();
    res.json(goal);
  } catch (error) {
    console.error("Error updating goals:", error);
    res.status(500).json({ message: "Server error while updating goals", error: error.message });
  }
};

/**
 * @route   POST /api/goals/expenditure
 * @desc    Add an expenditure transaction under a specific category for authenticated user
 */
export const addExpenditure = async (req, res) => {
  try {
    const userId = getUserIdFromToken(req);
    
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: No valid token" });
    }

    const { category, amount, description } = req.body;

    if (!category || !amount) {
      return res.status(400).json({ error: "Missing required fields: category, amount" });
    }

    // Check MongoDB connection
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ message: "Database not connected" });
    }

    const goal = await Goal.findOne({ userId });
    if (!goal) {
      return res.status(404).json({ error: "User goal data not found" });
    }

    goal.expenditureData[category].push({
      amount,
      description,
      date: new Date(),
    });

    // Calculate total expenditure
    let totalExpenditure = 0;
    for (const cat of Object.keys(goal.expenditureData)) {
      totalExpenditure += goal.expenditureData[cat].reduce(
        (sum, item) => sum + (item.amount || 0),
        0
      );
    }
    goal.currentExpenditure = totalExpenditure;

    await goal.save();
    res.json(goal);
  } catch (error) {
    console.error("Error in POST /api/goals/expenditure:", error);
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
};

/**
 * @route   POST /api/goals/savings
 * @desc    Add a savings transaction under a specific category for authenticated user
 */
export const addSavings = async (req, res) => {
  try {
    const userId = getUserIdFromToken(req);
    
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: No valid token" });
    }

    const { category, amount, description } = req.body;

    if (!category || !amount) {
      return res.status(400).json({ error: "Missing required fields: category, amount" });
    }

    // Check MongoDB connection
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ message: "Database not connected" });
    }

    const goal = await Goal.findOne({ userId });
    if (!goal) {
      return res.status(404).json({ error: "User goal data not found" });
    }

    goal.savingsData[category].push({
      amount,
      description,
      date: new Date(),
    });

    // Calculate total savings
    let totalSavings = 0;
    for (const cat of Object.keys(goal.savingsData)) {
      totalSavings += goal.savingsData[cat].reduce(
        (sum, item) => sum + (item.amount || 0),
        0
      );
    }
    goal.currentSavings = totalSavings;

    await goal.save();
    res.json(goal);
  } catch (error) {
    console.error("Error in POST /api/goals/savings:", error);
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
};



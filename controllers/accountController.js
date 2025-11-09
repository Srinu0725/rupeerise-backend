import Account from "../models/Account.js";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/constants.js";

// Helper function to extract userId from token or params
const getUserId = (req) => {
  // First try to get from JWT token (preferred)
  const token = req.headers.authorization?.split(" ")[1] || req.cookies?.token;
  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      return decoded.userId?.toString();
    } catch (err) {
      console.log("Token verification failed, using params");
    }
  }
  
  // Fallback to params (for backward compatibility)
  return req.params?.userId?.toString().trim();
};

export const getAccount = async (req, res) => {
  try {
    // Get userId from token only (token-based authentication)
    const userId = getUserId(req);
    
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized: No valid token provided" });
    }
    
    console.log("=".repeat(50));
    console.log("GET /account");
    console.log("  - UserId from token:", userId);
    console.log("  - MongoDB state:", mongoose.connection.readyState, "(1=connected)");
    console.log("  - Database name:", mongoose.connection.name);
    
    // Check MongoDB connection
    if (mongoose.connection.readyState !== 1) {
      console.error("❌ MongoDB not connected! State:", mongoose.connection.readyState);
      return res.status(503).json({ error: "Database not connected", state: mongoose.connection.readyState });
    }
    
    // Try to find account with userId from token
    let account = await Account.findOne({ userId });
    console.log("  - Found existing account:", account ? "Yes" : "No");
    
    if (account) {
      console.log("  - Account ID:", account._id);
      console.log("  - Account userId:", account.userId);
      console.log("  - Income:", account.income);
      console.log("  - Expenses count:", account.expenses?.length || 0);
    }
    
    if (!account) {
      // Create new account if doesn't exist
      console.log("  - Creating new account for userId:", userId);
      account = new Account({ 
        userId, 
        income: 0, 
        expense: 0, 
        balance: 0,
        expenses: []
      });
      
      try {
        await account.save();
        console.log("  ✅ New account created and saved successfully");
        console.log("  - Account ID:", account._id);
        console.log("  - Account userId:", account.userId);
        
        // Verify it was saved
        const verify = await Account.findOne({ userId });
        console.log("  - Verification - Account exists:", verify ? "Yes" : "No");
      } catch (saveError) {
        console.error("  ❌ Error saving new account:", saveError);
        console.error("  - Error name:", saveError.name);
        console.error("  - Error code:", saveError.code);
        console.error("  - Error message:", saveError.message);
        
        if (saveError.code === 11000) {
          // Duplicate key error - account was created between findOne and save
          console.log("  - Duplicate key error, fetching existing account...");
          account = await Account.findOne({ userId });
        } else {
          throw saveError;
        }
      }
    }
    
    console.log("=".repeat(50));
    res.json(account);
  } catch (error) {
    console.error("❌ Error fetching account:", error);
    console.error("  - Error name:", error.name);
    console.error("  - Error message:", error.message);
    console.error("  - Error stack:", error.stack);
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
};

export const updateAccount = async (req, res) => {
  try {
    // Get userId from token only (token-based authentication)
    const userId = getUserId(req);
    
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized: No valid token provided" });
    }
    
    const { income, expenses } = req.body;
    
    console.log("=".repeat(50));
    console.log("PUT /account");
    console.log("  - UserId from token:", userId);
    console.log("  - MongoDB state:", mongoose.connection.readyState, "(1=connected)");
    console.log("  - Request body income:", income);
    console.log("  - Request body expenses count:", expenses?.length);
    if (expenses && expenses.length > 0) {
      console.log("  - First expense sample:", JSON.stringify(expenses[0]));
    }
    
    // Check MongoDB connection
    if (mongoose.connection.readyState !== 1) {
      console.error("  ❌ MongoDB not connected! State:", mongoose.connection.readyState);
      return res.status(503).json({ error: "Database not connected", state: mongoose.connection.readyState });
    }
    
    // Find or create account
    let account = await Account.findOne({ userId });
    console.log("  - Found existing account:", account ? "Yes" : "No");
    
    if (!account) {
      console.log("  - Creating new account for userId:", userId);
      account = new Account({ 
        userId, 
        income: income || 0, 
        expense: 0, 
        balance: 0, 
        expenses: expenses || [] 
      });
      
      // Calculate expense if expenses provided
      if (expenses && Array.isArray(expenses) && expenses.length > 0) {
        account.expense = expenses.reduce((sum, exp) => sum + (parseFloat(exp.value) || 0), 0);
      }
      account.balance = account.income - account.expense;
    } else {
      // Update existing account
      console.log("  - Updating existing account");
      if (income !== undefined) {
        account.income = income;
      }
      
      if (expenses !== undefined && Array.isArray(expenses)) {
        account.expenses = expenses;
        // Calculate total expense
        account.expense = expenses.reduce((sum, exp) => sum + (parseFloat(exp.value) || 0), 0);
      }
      
      // Calculate balance
      account.balance = account.income - account.expense;
    }
    
    console.log("  - Account data before save:");
    console.log("    - userId:", account.userId);
    console.log("    - income:", account.income);
    console.log("    - expense:", account.expense);
    console.log("    - balance:", account.balance);
    console.log("    - expenses array length:", account.expenses?.length);
    
    // Save the account
    const savedAccount = await account.save();
    console.log("  ✅ Account saved successfully!");
    console.log("    - Saved account ID:", savedAccount._id);
    console.log("    - Saved account userId:", savedAccount.userId);
    
    // Verify it was saved
    const verifyAccount = await Account.findOne({ userId });
    if (verifyAccount) {
      console.log("  ✅ Verification - Account exists in DB");
      console.log("    - Verified income:", verifyAccount.income);
      console.log("    - Verified expenses count:", verifyAccount.expenses?.length);
    } else {
      console.error("  ❌ Verification FAILED - Account not found after save!");
    }
    
    console.log("=".repeat(50));
    res.json(savedAccount);
  } catch (error) {
    console.error("❌ Error updating account:", error);
    console.error("  - Error name:", error.name);
    console.error("  - Error message:", error.message);
    console.error("  - Error code:", error.code);
    if (error.errors) {
      console.error("  - Validation errors:", JSON.stringify(error.errors, null, 2));
    }
    if (error.code === 11000) {
      console.error("  - Duplicate key error - userId already exists");
    }
    res.status(500).json({ 
      error: "Internal Server Error", 
      details: error.message,
      errorName: error.name,
      errorCode: error.code
    });
  }
};

// Legacy endpoint for backward compatibility - now uses token
export const getAccountLegacy = async (req, res) => {
  try {
    // Try to get userId from token first
    const userId = getUserId(req);
    
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized: No valid token or userId provided" });
    }
    
    const account = await Account.findOne({ userId });
    if (account) {
      console.log("Fetched Account by userId:", account.userId);
      return res.json(account);
    }
    
    // Account not found - return 404 instead of fallback
    return res.status(404).json({ error: "Account not found" });
  } catch (error) {
    console.error("Error fetching account:", error);
    res.status(500).json({ error: "Internal Server Error"});
  }
};


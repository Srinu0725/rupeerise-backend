import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/constants.js";

// Middleware to verify JWT token and extract user info
export const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1] || req.cookies?.token;
  
  if (!token) {
    return res.status(403).json({ message: "Access denied. No token provided." });
  }

  try {
    const verified = jwt.verify(token, JWT_SECRET);
    req.user = verified; // Contains { userId: ... }
    req.userId = verified.userId; // Extract userId for convenience
    next();
  } catch (err) {
    res.status(400).json({ message: "Invalid token" });
  }
};

// Middleware to extract userId from token (optional - doesn't fail if no token)
export const extractUserId = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1] || req.cookies?.token;
  
  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.userId = decoded.userId;
    } catch (err) {
      // Token invalid, but continue (for optional auth routes)
    }
  }
  
  next();
};



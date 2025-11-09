import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { JWT_SECRET } from "../config/constants.js";
import mongoose from "mongoose";

export const register = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check MongoDB connection
    if (mongoose.connection.readyState !== 1) {
      const states = {
        0: 'disconnected',
        1: 'connected',
        2: 'connecting',
        3: 'disconnecting'
      };
      console.error('MongoDB not connected. Connection state:', states[mongoose.connection.readyState] || mongoose.connection.readyState);
      return res.status(503).json({ 
        message: 'Database connection error. Please check if MongoDB is running and restart the server.',
        details: `Connection state: ${states[mongoose.connection.readyState] || mongoose.connection.readyState}`
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Hash the password before saving
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error('Error in /register:', err);
    
    // Handle specific MongoDB errors
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: 'Validation error: ' + err.message });
    }
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Email already registered' });
    }
    if (err.name === 'MongoServerError' || err.name === 'MongooseError') {
      return res.status(503).json({ message: 'Database error. Please check your connection.' });
    }
    
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Wrong password" });

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "1h" });
    res.cookie("token", token, { httpOnly: true, secure: false }); // Set secure: true in production with HTTPS

    res.json({ message: "Login successful", token });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const logout = (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out successfully" });
};

export const getProfile = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    console.log("Received Token:", token);

    const decoded = jwt.verify(token, JWT_SECRET);
    console.log("Decoded User ID:", decoded.userId);

    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    console.log("Fetched User:", user);
    res.json(user);

  } catch (error) {
    console.error("Authentication error:", error);
    res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update fields (only update provided fields)
    const { email, phone, dob, address, city, zip, name } = req.body;

    if (name !== undefined) user.name = name;
    if (email !== undefined) {
      // Check if email is being changed and if it's already taken
      if (email !== user.email) {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
          return res.status(400).json({ message: "Email already in use" });
        }
        user.email = email;
      }
    }
    if (phone !== undefined) user.phone = phone;
    if (dob !== undefined) user.dob = dob ? new Date(dob) : null;
    if (address !== undefined) user.address = address;
    if (city !== undefined) user.city = city;
    if (zip !== undefined) user.zip = zip;

    await user.save();

    // Return user without password
    const updatedUser = await User.findById(decoded.userId).select("-password");
    res.status(200).json({ message: "Profile updated successfully", user: updatedUser });

  } catch (error) {
    console.error("Profile update error:", error);
    
    if (error.code === 11000) {
      return res.status(400).json({ message: "Email already in use" });
    }
    
    res.status(500).json({ message: "Error updating profile", error: error.message });
  }
};


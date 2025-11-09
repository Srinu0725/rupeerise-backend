import express from "express";
import { register, login, logout, getProfile, updateProfile } from "../controllers/authController.js";

const router = express.Router();

// Auth routes
router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/profile", getProfile);
router.put("/profile", updateProfile);

export default router;


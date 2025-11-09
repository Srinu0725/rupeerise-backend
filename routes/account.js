import express from "express";
import { getAccount, updateAccount } from "../controllers/accountController.js";

const router = express.Router();

// Get account data for authenticated user (token-based)
router.get("/", getAccount);

// Update account data (income, expenses) for authenticated user (token-based)
router.put("/", updateAccount);

export default router;



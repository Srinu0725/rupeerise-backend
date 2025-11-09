import express from "express";
import { createTransaction, getTransactions } from "../controllers/transactionController.js";

const router = express.Router();

// POST /api/transactions → Add new transaction for authenticated user
router.post("/", createTransaction);

// GET /api/transactions → Get all transactions for authenticated user
router.get("/", getTransactions);

export default router;



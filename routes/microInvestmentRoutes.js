import express from "express";
import { getMicroInvestments, createMicroInvestment, deleteMicroInvestment } from "../controllers/microInvestmentController.js";

const router = express.Router();

// GET /api/microinvestment → Get all micro investment allocations for authenticated user
router.get("/", getMicroInvestments);

// POST /api/microinvestment → Add a new allocation for authenticated user
router.post("/", createMicroInvestment);

// DELETE /api/microinvestment/:id → Remove an allocation (requires userId in body for verification)
router.delete("/:id", deleteMicroInvestment);

export default router;



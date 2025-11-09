import express from "express";
import { getTotalSavings } from "../controllers/budgetController.js";

const router = express.Router();

// GET /api/budget/total-savings → Get total savings for authenticated user
router.get("/total-savings", getTotalSavings);

export default router;



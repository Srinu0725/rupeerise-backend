import express from "express";
import { getGoal, updateGoals, addExpenditure, addSavings } from "../controllers/goalController.js";

const router = express.Router();

/**
 * @route   GET /api/goals
 * @desc    Get goal data for the authenticated user
 */
router.get("/", getGoal);

/**
 * @route   POST /api/goals
 * @desc    Update or set monthly goals (savings & expenditure) for authenticated user
 */
router.post("/", updateGoals);

/**
 * @route   POST /api/goals/expenditure
 * @desc    Add expenditure for authenticated user
 */
router.post("/expenditure", addExpenditure);

/**
 * @route   POST /api/goals/savings
 * @desc    Add savings for authenticated user
 */
router.post("/savings", addSavings);

export default router;


import express from "express";
import { addSavings } from "../controllers/goalController.js";

const router = express.Router();

/**
 * @route   POST /api/savings
 * @desc    Add a savings transaction under a specific category
 */
router.post("/", addSavings);

export default router;



import express from "express";
import { addExpenditure } from "../controllers/goalController.js";

const router = express.Router();

/**
 * @route   POST /api/expenditure
 * @desc    Add an expenditure transaction under a specific category
 */
router.post("/", addExpenditure);

export default router;



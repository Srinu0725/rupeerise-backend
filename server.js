import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./config/database.js";
import { PORT, CORS_ORIGINS } from "./config/constants.js";

// Import routes
import authRoutes from "./routes/auth.js";
import accountRoutes from "./routes/account.js";
import transactionRoutes from "./routes/transactionRoutes.js";
import budgetRoutes from "./routes/budgetRoutes.js";
import microInvestmentRoutes from "./routes/microInvestmentRoutes.js";
import goalRoutes from "./routes/goalRoutes.js";

const app = express();

// Middleware
app.use(
  cors({
    origin: CORS_ORIGINS,
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// Connect to MongoDB
connectDB();

// Routes
app.use("/", authRoutes); // This will handle /register, /login, /logout, /profile
app.use("/account", accountRoutes); // This will handle /account (token-based)
app.use("/api/transactions", transactionRoutes); // This will handle /api/transactions (token-based)
app.use("/api/budget", budgetRoutes); // This will handle /api/budget/total-savings (token-based)
app.use("/api/microinvestment", microInvestmentRoutes); // This will handle /api/microinvestment (token-based)
app.use("/api/goals", goalRoutes); // This will handle /api/goals (token-based) and /api/goals/expenditure, /api/goals/savings

// Health check
app.get("/", (req, res) => {
  res.send("RupeeRise Backend is running 🚀");
});

// Test route
app.get("/test", (req, res) => {
  res.json({ message: "Server is running!", routes: "All routes are token-based" });
});

// Start server
app.listen(PORT, () => {
  console.log(`server started at ${PORT}`);
  console.log(`✅ Routes registered:`);
  console.log(`   POST /register`);
  console.log(`   POST /login`);
  console.log(`   POST /logout`);
  console.log(`   GET  /profile`);
  console.log(`   PUT  /profile`);
  console.log(`   GET  /account (token-based)`);
  console.log(`   PUT  /account (token-based)`);
  console.log(`   POST /api/transactions (token-based)`);
  console.log(`   GET  /api/transactions (token-based)`);
  console.log(`   GET  /api/budget/total-savings (token-based)`);
  console.log(`   GET  /api/microinvestment (token-based)`);
  console.log(`   POST /api/microinvestment (token-based)`);
  console.log(`   DELETE /api/microinvestment/:id (token-based)`);
  console.log(`   GET  /api/goals (token-based)`);
  console.log(`   POST /api/goals (token-based)`);
  console.log(`   POST /api/goals/expenditure (token-based)`);
  console.log(`   POST /api/goals/savings (token-based)`);
});

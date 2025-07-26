import express from "express";
const app = express();
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import cors from "cors";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import authMiddleware from "./authMiddleware.js";

const port = 5000;
app.use(
  cors({
    origin: ["http://localhost:5173", "https://rupeerise.netlify.app"], // Allow only your frontend origin
    credentials: true, // Allow cookies & authentication headers
  })
);
app.use(express.json());
app.use(cookieParser());


mongoose
  .connect("mongodb://localhost:27017/test")
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("MongoDB Connection Error:", err));


const usermodle = mongoose.model(
  "account",
  new mongoose.Schema({ name: String , balance: Number , income: Number , expense: Number }), "account"
);

const JWT_SECRET = "aV3ry5tr0ng&L0ng!s3cr3tK3y@2025";

// mongoose
//   .connect("mongodb://localhost:27017/", {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//   })
//   .then(() => console.log("MongoDB Connected"))
//   .catch((err) => console.log("MongoDB Connection Error:", err));

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const User = mongoose.model("User", UserSchema);


const GoalSchema = new mongoose.Schema({
  userId: { type: String, required: true },


  // Monthly Goals
  expenditureGoal: { type: Number, default: 0 },
  savingsGoal: { type: Number, default: 0 },


  // Current Totals
  currentExpenditure: { type: Number, default: 0 },
  currentSavings: { type: Number, default: 0 },


  // Expenditure breakdown by category
  expenditureData: {
    medical: [
      {
        amount: Number,
        description: String,
        date: { type: Date, default: Date.now },
      },
    ],
    home: [
      {
        amount: Number,
        description: String,
        date: { type: Date, default: Date.now },
      },
    ],
    investment: [
      {
        amount: Number,
        description: String,
        date: { type: Date, default: Date.now },
      },
    ],
    emergency: [
      {
        amount: Number,
        description: String,
        date: { type: Date, default: Date.now },
      },
    ],
    others: [
      {
        amount: Number,
        description: String,
        date: { type: Date, default: Date.now },
      },
    ],
  },


  // Savings breakdown by category
  savingsData: {
    medical: [
      {
        amount: Number,
        description: String,
        date: { type: Date, default: Date.now },
      },
    ],
    home: [
      {
        amount: Number,
        description: String,
        date: { type: Date, default: Date.now },
      },
    ],
    investment: [
      {
        amount: Number,
        description: String,
        date: { type: Date, default: Date.now },
      },
    ],
    emergency: [
      {
        amount: Number,
        description: String,
        date: { type: Date, default: Date.now },
      },
    ],
    others: [
      {
        amount: Number,
        description: String,
        date: { type: Date, default: Date.now },
      },
    ],
  },
});
const GoalModel = mongoose.model("Goal", GoalSchema);


/****************************************************************
 * 4) Transaction Schema & Model
 ****************************************************************/
const TransactionSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  amount: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  roundingType: {
    type: String,
    enum: ["nearest-decimal", "nearest-tens", "nearest-hundreds"],
    required: true,
  },
});
const Transaction = mongoose.model("Transaction", TransactionSchema);




app.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const newUser = new User({ name, email, password });
    await newUser.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error('Error in /register:', err);
    res.status(500).json({ message: 'Server Error' });
  }
});




app.post("/login", async (req, res) => {
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
    console.error("Login Error:", error); // Log the exact error
    res.status(500).json({ message: "Server error", error: error.message });
  }});
  

// Middleware to Protect Routes
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(403).json({ message: "Access denied" });

  try {
    const verified = jwt.verify(token, JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    res.status(400).json({ message: "Invalid token" });
  }
};

app.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out successfully" });
});


// Protected Route Example
// router.get("/protected-route", verifyToken, (req, res) => {
//   res.json({ message: "You have accessed a protected route!", user: req.user });
// });

app.get("/account", async (req, res) => {
  try {
    const id = "67ffac341c127727b55100d8";
    const users = await usermodle.findById(id);
    console.log("Fetched Users:", users); // ✅ Debugging output
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error); // Log the error
    res.status(500).json({ error: "Internal Server Error"});
}
});

app.get("/profile", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    console.log("Received Token:", token);

    const decoded = jwt.verify(token, JWT_SECRET);
    console.log("Decoded User ID:", decoded.userId);

    const user = await User.findById(decoded.userId).select("name email");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    console.log("Fetched User:", user); // ✅ Debugging output
    res.json(user); // ✅ Send user object

  } catch (error) {
    console.error("Authentication error:", error);
    res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
});

/**
 * POST /api/goals
 * Create or update a user's monthly expenditure & savings goals.
 * Body: { userId, expenditureGoal, savingsGoal }
 */
app.post("/api/goals", async (req, res) => {

  const { userId, expenditureGoal, savingsGoal } = req.body;
  try {
    let goal = await GoalModel.findOne({ userId });
    if (!goal) {
      goal = new GoalModel({ userId , expenditureGoal, savingsGoal });
    } else {
      goal.expenditureGoal = expenditureGoal;
      goal.savingsGoal = savingsGoal;
    }
    await goal.save();
    res.json(goal);
  } catch (error) {
    console.error("Error in POST /api/goals:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


/**
 * GET /api/goals/:userId
 * Fetch the goal record for a specific user.
 */
app.get("/api/goals/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const goal = await GoalModel.findOne({ userId });
    if (!goal) {
      return res.status(404).json({ error: "Goal data not found" });
    }
    res.json(goal);
  } catch (error) {
    console.error("Error in GET /api/goals/:userId:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * POST /api/savings
 * Add a new savings entry to the specified category & update total savings.
 * Body: { userId, category, amount, description }
 */
app.post("/api/savings", async (req, res) => {
  const { userId, category, amount, description } = req.body;
  try {
    const goal = await GoalModel.findOne({ userId });
    if (!goal) {
      return res.status(404).json({ error: "User goal data not found" });
    }
    goal.savingsData[category].push({
      amount,
      description,
      date: new Date(),
    });
    let totalSavings = 0;
    for (const cat of Object.keys(goal.savingsData)) {
      totalSavings += goal.savingsData[cat].reduce(
        (sum, item) => sum + (item.amount || 0),
        0
      );
    }
    goal.currentSavings = totalSavings;
    await goal.save();
    res.json(goal);
  } catch (error) {
    console.error("Error in POST /api/savings:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * POST /api/expenditure
 * Add a new expenditure entry to the specified category & update total expenditure.
 * Body: { userId, category, amount, description }
 */
app.post("/api/expenditure", async (req, res) => {
  const { userId, category, amount, description } = req.body;
  try {
    const goal = await GoalModel.findOne({ userId });
    if (!goal) {
      return res.status(404).json({ error: "User goal data not found" });
    }
    goal.expenditureData[category].push({
      amount,
      description,
      date: new Date(),
    });
    let totalExpenditure = 0;
    for (const cat of Object.keys(goal.expenditureData)) {
      totalExpenditure += goal.expenditureData[cat].reduce(
        (sum, item) => sum + (item.amount || 0),
        0
      );
    }
    goal.currentExpenditure = totalExpenditure;
    await goal.save();
    res.json(goal);
  } catch (error) {
    console.error("Error in POST /api/expenditure:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});





/****************************************************************
 * 7) Budget Logic: Rounding Helpers + total-savings Route
 ****************************************************************/
// Rounding helpers
function roundToDecimal(value) {
  return Math.ceil(value * 10) / 10;
}
function roundToTens(value) {
  return Math.ceil(value / 10) * 10;
}
function roundToHundreds(value) {
  return Math.ceil(value / 100) * 100;
}
function computeRoundedAmount(amount, roundingType) {
  switch (roundingType) {
    case "nearest-decimal":
      return roundToDecimal(amount);
    case "nearest-tens":
      return roundToTens(amount);
    case "nearest-hundreds":
      return roundToHundreds(amount);
    default:
      return amount;
  }
}


/**
 * GET /api/budget/total-savings/:userId
 * Sum up (roundedAmount - originalAmount) for each transaction.
 */
app.get("/api/budget/total-savings/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const transactions = await Transaction.find({ userId });
    let totalSavings = 0;
    for (const tx of transactions) {
      const rounded = computeRoundedAmount(tx.amount, tx.roundingType);
      totalSavings += (rounded - tx.amount);
    }
    res.json({ totalSavings });
  } catch (error) {
    console.error("Error in GET /api/budget/total-savings/:userId:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


/****************************************************************
 * 8) Transactions Routes
 ****************************************************************/
/**
 * GET /api/transactions/:userId
 * Fetch all transactions for a specific user.
 */
app.get("/api/transactions/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    // Sort by date ascending
    const transactions = await Transaction.find({ userId }).sort({ date: 1 });
    res.json(transactions);
  } catch (error) {
    console.error("Error in GET /api/transactions/:userId:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


/**
 * POST /api/transactions
 * Add a new transaction for a user.
 * Body: { userId, amount, date, roundingType }
 */
app.post("/api/transactions", async (req, res) => {
  try {
    const { userId, amount, date, roundingType } = req.body;
    if (!userId || !amount || !roundingType) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    // Optional: ensure user exists
    const userExists = await User.findById(userId);
    if (!userExists) {
      return res.status(404).json({ error: "User not found" });
    }
    const newTransaction = new Transaction({
      userId,
      amount,
      date: date ? new Date(date) : new Date(),
      roundingType,
    });
    await newTransaction.save();
    res.json(newTransaction);
  } catch (error) {
    console.error("Error in POST /api/transactions:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});







/****************************************************************
 * 9) Micro Investment (Allocations)
 ****************************************************************/
// A) MicroInvestment Schema (UPDATED to store description)
const MicroInvestmentSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  category: {
    type: String,
    enum: ["medical", "home", "investment", "emergency", "others"],
    required: true,
  },
  amount: { type: Number, required: true },
  description: { type: String, default: "" },
  date: { type: Date, default: Date.now },
});
const MicroInvestment = mongoose.model("MicroInvestment", MicroInvestmentSchema);


// Helper to compute total budget savings
async function computeUserTotalSavings(userId) {
  const transactions = await Transaction.find({ userId });
  let total = 0;
  for (const tx of transactions) {
    const rounded = computeRoundedAmount(tx.amount, tx.roundingType);
    total += (rounded - tx.amount);
  }
  return total;
}


/**
 * GET /api/microinvestment/:userId
 * Fetch all micro investment allocations for that user.
 */
app.get("/api/microinvestment/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const allocations = await MicroInvestment.find({ userId });
    res.json(allocations);
  } catch (error) {
    console.error("Error in GET /api/microinvestment:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


/**
 * POST /api/microinvestment
 * Add a new allocation, ensuring it doesn't exceed unallocated.
 * Body: { userId, category, amount, description }
 */
app.post("/api/microinvestment", async (req, res) => {
  try {
    let { userId, category, amount, description } = req.body;
    if (!userId || !category || !amount) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    amount = parseFloat(amount);
    if (isNaN(amount) || amount <= 0) {
      return res.status(400).json({ error: "Invalid amount" });
    }
    // 1) total savings from budget
    const totalBudgetSavings = await computeUserTotalSavings(userId);
    // 2) sum of existing allocations
    const existingAllocations = await MicroInvestment.find({ userId });
    const allocatedSoFar = existingAllocations.reduce((sum, a) => sum + a.amount, 0);
    // 3) unallocated
    const unallocated = totalBudgetSavings - allocatedSoFar;
    if (amount > unallocated) {
      return res.status(400).json({ error: "Cannot allocate more than unallocated" });
    }
    // 4) Create new allocation (include description)
    const newAlloc = new MicroInvestment({ userId, category, amount, description });
    await newAlloc.save();
    res.json(newAlloc);
  } catch (error) {
    console.error("Error in POST /api/microinvestment:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


/**
 * DELETE /api/microinvestment/:id
 * Remove an allocation.
 */
app.delete("/api/microinvestment/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await MicroInvestment.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ error: "Allocation not found" });
    }
    res.json({ message: "Allocation deleted" });
  } catch (error) {
    console.error("Error in DELETE /api/microinvestment/:id:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});





// Update Profile
app.put("/api/profile/:userId", async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.userId,
      req.body,
      { new: true, runValidators: true }
    ).select("-password");


    if (!updatedUser) return res.status(404).json({ error: "User not found" });


    res.json(updatedUser);
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.put("/api/profile/:userId/password", async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    console.log("Received password update request:", { oldPassword, newPassword });


    if (!oldPassword || !newPassword) {
      console.error("Missing fields:", req.body);
      return res.status(400).json({ error: "Both old and new passwords are required" });
    }


    // Find the user by ID
    const user = await User.findById(req.params.userId);
    if (!user) {
      console.error("User not found for ID:", req.params.userId);
      return res.status(404).json({ error: "User not found" });
    }


    // Compare the provided old password with the stored hashed password
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      console.error("Old password does not match for user:", req.params.userId);
      return res.status(400).json({ error: "Old password is incorrect" });
    }


    // Hash the new password and update the user
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();


    console.log("Password updated successfully for user:", req.params.userId);
    res.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Error updating password:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/", (req, res) => {
  res.send("RupeeRise Backend is running 🚀");
});


app.listen(port, () => {
  console.log(`server started at ${port}`);
});
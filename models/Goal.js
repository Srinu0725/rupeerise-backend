import mongoose from "mongoose";

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
    medical: [{
      amount: Number,
      description: String,
      date: { type: Date, default: Date.now },
    }],
    home: [{
      amount: Number,
      description: String,
      date: { type: Date, default: Date.now },
    }],
    investment: [{
      amount: Number,
      description: String,
      date: { type: Date, default: Date.now },
    }],
    emergency: [{
      amount: Number,
      description: String,
      date: { type: Date, default: Date.now },
    }],
    others: [{
      amount: Number,
      description: String,
      date: { type: Date, default: Date.now },
    }],
  },

  // Savings breakdown by category
  savingsData: {
    medical: [{
      amount: Number,
      description: String,
      date: { type: Date, default: Date.now },
    }],
    home: [{
      amount: Number,
      description: String,
      date: { type: Date, default: Date.now },
    }],
    investment: [{
      amount: Number,
      description: String,
      date: { type: Date, default: Date.now },
    }],
    emergency: [{
      amount: Number,
      description: String,
      date: { type: Date, default: Date.now },
    }],
    others: [{
      amount: Number,
      description: String,
      date: { type: Date, default: Date.now },
    }],
  },
});

const Goal = mongoose.model("Goal", GoalSchema);

export default Goal;



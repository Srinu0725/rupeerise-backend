import mongoose from "mongoose";

const AccountSchema = new mongoose.Schema({ 
  name: String, 
  balance: Number, 
  income: Number, 
  expense: Number,
  expenses: [{
    id: String,
    name: String,
    value: Number,
    category: String,
    date: String
  }],
  userId: { type: String, required: true, unique: true, index: true }
}, { timestamps: true });

const Account = mongoose.model("Account", AccountSchema, "account");

// Keep legacy name for backward compatibility
export const usermodle = Account;
export default Account;



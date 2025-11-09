import mongoose from "mongoose";

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

export default Transaction;



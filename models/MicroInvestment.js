import mongoose from "mongoose";

const MicroInvestmentSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  category: { type: String, required: true },
  amount: { type: Number, required: true },
  description: { type: String, default: "" },
}, { timestamps: true });

const MicroInvestment = mongoose.model("MicroInvestment", MicroInvestmentSchema);

export default MicroInvestment;


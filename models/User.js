import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  // Additional profile fields
  firstName: { type: String, default: "" },
  lastName: { type: String, default: "" },
  phone: { type: String, default: "" },
  dob: { type: Date, default: null },
  address: { type: String, default: "" },
  city: { type: String, default: "" },
  zip: { type: String, default: "" },
}, { timestamps: true });

const User = mongoose.model("User", UserSchema);

export default User;


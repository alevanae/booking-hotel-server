const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    username: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true, trim: true },
    fullName: { type: String, trim: true },
    phoneNumber: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true },
    isAdmin: { type: Boolean, default: false, unique: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);

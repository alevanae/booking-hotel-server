const { Timestamp } = require("mongodb");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const transactionSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    hotelId: { type: Schema.Types.ObjectId, ref: "Hotel" },
    roomTypes: [{ type: Schema.Types.ObjectId, ref: "RoomType" }],
    roomNumbers: [{ type: Number, required: true }],
    dateStart: { type: Date, required: true },
    dateEnd: { type: Date, required: true },
    totalPrice: { type: Number, required: true },
    payment: { type: String, enum: ["Credit Card", "Cash"], required: true },
    status: {
      type: String,
      enum: ["booked", "checking", "checkout"],
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Transaction", transactionSchema);

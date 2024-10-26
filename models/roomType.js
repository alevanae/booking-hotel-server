const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const roomTypeSchema = new Schema(
  {
    title: { type: String, required: true },
    price: { type: Number, required: true },
    maxPeople: { type: Number, required: true },
    desc: { type: String, required: true },
    roomNumbers: [{ type: Number }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("RoomType", roomTypeSchema);

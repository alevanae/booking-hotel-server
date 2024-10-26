const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const hotelSchema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    type: {
      type: String,
      required: true,
      enum: ["hotel", "apartment", "resort", "villa", "cabin"],
    },
    title: { type: String, required: true },
    city: { type: String, required: true },
    address: { type: String, required: true },
    distance: { type: Number, required: true },
    photos: [String],
    desc: { type: String, required: true },
    rating: { type: Number, min: 0, max: 5, default: 4 },
    featured: { type: Boolean, required: true },
    cheapestPrice: { type: Number, required: true },
    roomType: [{ type: Schema.Types.ObjectId, ref: "RoomType" }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Hotel", hotelSchema);

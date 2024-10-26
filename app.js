const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const transactionRoute = require("./routes/transactionRoute");
const userRoute = require("./routes/userRoute");
const hotelRoute = require("./routes/hotelRoute");

const Transaction = require("./models/transaction");

const app = express();
const uri =
  "mongodb+srv://anhtri:3VDFcPPyrmCRjmnA@mongo.eklzgvx.mongodb.net/asm2?retryWrites=true&w=majority&appName=mongo";

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// update transaction by time
app.use(async (req, res, next) => {
  try {
    const transactions = await Transaction.find();
    if (transactions.length > 0) {
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      for (const transaction of transactions) {
        if (transaction.dateStart <= now && now <= transaction.dateEnd)
          transaction.status = "checking";
        if (transaction.dateEnd < now) transaction.status = "checkout";
      }
      const allPromises = transactions.map((transaction) => transaction.save());
      await Promise.all(allPromises);
    }
    next();
  } catch (err) {
    res.status(500).json({ status: "fail", message: err.message });
  }
});

app.use("/user", userRoute);
app.use("/hotel", hotelRoute);
app.use("/transaction", transactionRoute);

async function connectDb() {
  mongoose.connect(uri);
  console.log("connected");
  app.listen(5000);
}
connectDb();

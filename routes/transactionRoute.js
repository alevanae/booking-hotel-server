const express = require("express");
const transactionController = require("../controllers/transactionController");

const route = express.Router();

route.post("/unavailable-room", transactionController.getUnavailableRoom);
route.post("/client/:hotelId", transactionController.createUserTransaction);
route.get("/client/:userId", transactionController.getUserTransactions);
route.get("/admin/:userId", transactionController.getAllTransactions);

module.exports = route;

const express = require("express");
const userController = require("../controllers/userController");

const route = express.Router();

route.post("/", userController.createUser);
route.post("/client/login", userController.loginClient);
route.post("/client/auto-login", userController.loginById);
route.post("/admin/login", userController.loginAdmin);
route.post("/admin/auto-login", userController.loginByIdAdmin);
route.get("/admin", userController.getUsers);

module.exports = route;

//mongoimport mongodb+srv://anhtri:3VDFcPPyrmCRjmnA@mongo.eklzgvx.mongodb.net/asm2?retryWrites=true&w=majority&appName=mongo C:\Users\Thong Tri\Desktop\nodejs\asm2\server\data\hotels.json

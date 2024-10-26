const express = require("express");
const hotelController = require("../controllers/hotelController");

const route = express.Router();
route.get("/client/types", hotelController.getHotelTypesData);
route.get("/client/cities", hotelController.getCitiesData);
route.get("/client/top-rate", hotelController.getTopRatedHotel);
route.get("/client/:id", hotelController.getHotelById);
route.post("/client/search", hotelController.searchHotel);
//admin
route.get("/admin/room", hotelController.getRoomTypes);
route.get("/admin/room/:roomId", hotelController.getRoomTypeById);
route.post("/admin/room", hotelController.createRoomType);
route.delete("/admin/room/:roomId", hotelController.deleteRoomType);
route.patch("/admin/room/:roomId", hotelController.editRoomType);
route.get("/admin/:userId", hotelController.getAllHotels);
route.delete("/admin/:hotelId", hotelController.deleteHotel);
route.post("/admin", hotelController.createHotel);
route.patch("/admin/:hotelId", hotelController.editHotel);

module.exports = route;

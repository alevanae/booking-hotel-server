const Hotel = require("../models/hotel");
const Transaction = require("../models/transaction");
const RoomType = require("../models/roomType");
const User = require("../models/user");
const hotel = require("../models/hotel");

exports.getHotelTypesData = async (req, res) => {
  try {
    const hotels = await Hotel.find();
    const hotelTypesData = hotels.reduce((acc, item) => {
      const existing = acc.find((hotel) => hotel.name === item.type);
      if (existing) {
        existing.count += 1;
      } else {
        acc.push({ name: item.type, count: 1 });
      }
      return acc;
    }, []);
    res.status(200).json({ status: "success", data: hotelTypesData });
  } catch (err) {
    res.status(500).json({ status: "fail", message: err.message });
  }
};

exports.getCitiesData = async (req, res) => {
  try {
    const hotels = await Hotel.find();
    const cities = hotels.reduce((acc, item) => {
      const existing = acc.find((hotel) => hotel.city === item.city);
      if (existing) {
        existing.count += 1;
      } else {
        acc.push({ city: item.city, count: 1 });
      }
      return acc;
    }, []);
    if (!cities.find((city) => city.city === "Da Nang"))
      cities.push({ city: "Da Nang", count: 0 });
    res.status(200).json({ status: "success", data: cities });
  } catch (err) {
    res.status(500).json({ status: "fail", message: err.message });
  }
};

exports.getHotelByType = async (req, res) => {
  try {
    const type = req.body.type.toLowerCase();
    const hotels = await Hotel.find({ type });
    res.json({ status: "success", data: hotels });
  } catch (err) {
    res.json({ status: "fail", message: err.message });
  }
};

exports.getTopRatedHotel = async (req, res) => {
  try {
    const hotels = await Hotel.find().select(
      "name city cheapestPrice rate photos _id type"
    );
    hotels.sort((a, b) => b.rating - a.rating);
    const top3Hotel = hotels.slice(0, 3);
    res.json({ status: "success", data: top3Hotel });
  } catch (err) {
    res.json({ status: "fail", message: err.message });
  }
};

exports.getHotelById = async (req, res) => {
  try {
    const { id } = req.params;
    const hotel = await Hotel.findById(id).populate("roomType");
    res.json({ status: "success", data: hotel });
  } catch (err) {
    res.json({ status: "fail", message: err.message });
  }
};

exports.searchHotel = async (req, res) => {
  try {
    const { city, peopleQuantity, roomQuantity, distance, minPrice, maxPrice } =
      req.body;
    const dateStart = new Date(req.body.dateStart);
    const dateEnd = new Date(req.body.dateEnd);
    // find hotel by city
    const regex = new RegExp(city, "i");
    const searchByCity = await Hotel.find({ city: regex })
      .populate({ path: "roomType", select: "-_id -__v -createdAt -updatedAt" })
      .select("-__v");
    //find unavailable room
    const transactions = await Transaction.find({
      status: "booked" || "checking",
    });
    const searchByTime = transactions.filter((room) => {
      if (room) {
        return (
          (room.dateStart <= dateStart && dateStart <= room.dateEnd) ||
          (room.dateStart <= dateEnd && dateEnd <= room.dateEnd) ||
          (dateStart <= room.dateStart && room.dateEnd <= dateEnd)
        );
      } else return false;
    });
    for (const hotel of searchByCity) {
      let unavailableRooms = [];
      for (const transaction of searchByTime) {
        if (hotel._id.equals(transaction.hotelId))
          unavailableRooms.push(...transaction.roomNumbers);
      }
      let maxPeople = 0;
      let maxRoom = 0;
      let maxPrice = 0;
      for (const rooms of hotel.roomType) {
        maxRoom += rooms.roomNumbers.length;
        maxPrice = Math.max(maxPrice, rooms.price);
        for (const roomNumber of rooms.roomNumbers) {
          if (unavailableRooms.includes(roomNumber)) {
            maxRoom--;
            continue;
          } else maxPeople += rooms.maxPeople;
        }
      }
      //add properties for calculate
      hotel.maxPeople = maxPeople;
      hotel.maxRoom = maxRoom;
      hotel.maxPrice = maxPrice;
      // set virtual properties
      hotel.set("maxPeople", maxPeople, { strict: false });
      hotel.set("maxRoom", maxRoom, { strict: false });
      hotel.set("unavailableRooms", unavailableRooms, { strict: false });
      hotel.set("maxPrice", maxPrice, { strict: false });
    }
    let result = searchByCity.filter(
      (hotel) =>
        peopleQuantity <= hotel.maxPeople && roomQuantity <= hotel.maxRoom
    );
    if (distance || minPrice || maxPrice) {
      if (distance) {
        result = result.filter((hotel) => hotel.distance <= distance);
      }
      if (minPrice) {
        result = result.filter((hotel) => hotel.cheapestPrice >= minPrice);
      }
      if (maxPrice) {
        result = result.filter((hotel) => hotel.maxPrice <= maxPrice);
      }
    }

    res.status(200).json({
      status: "success",
      data: result,
    });
  } catch (err) {
    res.json({ status: "fail", message: err.message });
  }
};

// admin
exports.getAllHotels = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    let { page } = req.query;
    if (!user.isAdmin)
      return res
        .status(403)
        .json({ status: "fail", message: "Your access is now allowed" });
    const hotels = await Hotel.find();
    if (!page)
      return res.status(200).json({
        status: "success",
        hotelsQty: hotels.length,
        data: hotels,
      });
    const get8Hotels = (hotels, page) => {
      return hotels
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice((page - 1) * 8, page * 8);
    };
    res.status(200).json({
      status: "success",
      hotelsQty: hotels.length,
      data: get8Hotels(hotels, page),
    });
  } catch (err) {
    res.status(500).json({ status: "fail", message: err.message });
  }
};

exports.deleteHotel = async (req, res) => {
  try {
    const { hotelId } = req.params;
    const transactions = await Transaction.find({
      hotelId: hotelId,
      status: { $in: ["booked", "checking"] },
    });
    if (transactions.length > 0) {
      return res.status(405).json({
        status: "fail",
        message: "This hotel is in transaction",
      });
    }
    await Hotel.findByIdAndDelete(hotelId);
    res.status(200).json({ status: "success" });
  } catch (err) {
    res.status(500).json({ status: "fail", message: err.message });
  }
};

exports.createHotel = async (req, res) => {
  try {
    const {
      name,
      type,
      city,
      address,
      distance,
      title,
      desc,
      cheapestPrice,
      photos,
      featured,
      roomType,
      userId,
    } = req.body;
    const user = await User.findById(userId);

    if (!user.isAdmin)
      return res
        .status(403)
        .json({ status: "fail", message: "Your access is now allowed" });
    await Hotel.create({
      name,
      type,
      city,
      address,
      distance,
      title,
      desc,
      cheapestPrice,
      photos,
      featured,
      roomType,
    });
    res.status(201).json({ status: "success" });
  } catch (err) {
    res.json({ status: "fail", message: err.message });
  }
};
exports.editHotel = async (req, res) => {
  try {
    const { hotelId } = req.params;
    const {
      name,
      type,
      city,
      address,
      distance,
      title,
      desc,
      cheapestPrice,
      photos,
      featured,
      roomType,
      userId,
    } = req.body;
    const user = await User.findById(userId);
    if (!user.isAdmin)
      return res
        .status(403)
        .json({ status: "fail", message: "Your access is now allowed" });
    const hotel = await Hotel.findByIdAndUpdate(hotelId, {
      name,
      type,
      city,
      address,
      distance,
      title,
      desc,
      cheapestPrice,
      photos,
      featured,
      roomType,
    });
    res.status(201).json({ status: "success" });
  } catch (err) {
    res.json({ status: "fail", message: err.message });
  }
};
exports.getRoomTypes = async (req, res) => {
  try {
    const roomTypes = await RoomType.find();
    const { page } = req.query;
    if (!page)
      return res.status(200).json({ status: "success", data: roomTypes });
    const get8Rooms = (rooms, page) => {
      return rooms
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice((page - 1) * 8, page * 8);
    };
    res
      .status(200)
      .json({ status: "success", data: get8Rooms(roomTypes, page) });
  } catch (err) {
    res.status(500).json({ status: "fail", message: err.message });
  }
};
exports.getRoomTypeById = async (req, res) => {
  try {
    const { roomId } = req.params;
    const roomType = await RoomType.findById(roomId);
    res.status(200).json({ status: "success", data: roomType });
  } catch (err) {
    res.status(500).json({ status: "fail", message: err.message });
  }
};
exports.deleteRoomType = async (req, res) => {
  try {
    const { roomId } = req.params;
    const transactions = await Transaction.find({
      status: { $in: ["booked", "checking"] },
      roomTypes: roomId,
    });

    if (transactions.length > 0)
      return res
        .status(405)
        .json({ status: "fail", message: "This room is in transaction" });
    await RoomType.findByIdAndDelete(roomId);
    res.status(200).json({ status: "success" });
  } catch (err) {
    res.status(500).json({ status: "fail", message: err.message });
  }
};
exports.createRoomType = async (req, res) => {
  try {
    const { title, desc, price, maxPeople, roomNumbers } = req.body;
    await RoomType.create({ title, desc, price, maxPeople, roomNumbers });
    res.status(201).json({ status: "success" });
  } catch (err) {
    res.status(500).json({ status: "fail", message: err.message });
  }
};
exports.editRoomType = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { title, desc, price, maxPeople, roomNumbers } = req.body;
    const roomType = await RoomType.findByIdAndUpdate(roomId, {
      title,
      desc,
      price,
      maxPeople,
      roomNumbers,
    });
    res.status(201).json({ status: "success" });
  } catch (err) {
    res.status(500).json({ status: "fail", message: err.message });
  }
};

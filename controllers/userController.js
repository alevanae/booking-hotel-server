const User = require("../models/user");

exports.createUser = async (req, res) => {
  try {
    const { email, password, username, fullName, phoneNumber } = req.body;
    const newUser = new User({
      email,
      password,
      username,
      fullName,
      phoneNumber,
    });
    await newUser.save();
    res.status(201).json({ status: "success" });
  } catch (err) {
    res.status(500).json({ status: "fail", message: err.message });
  }
};

exports.loginClient = async (req, res) => {
  try {
    const { email, password } = req.body;
    let username;
    let user;
    if (!email.includes("@")) {
      username = email;
      user = await User.findOne({ password, username }).select(
        "email username phoneNumber _id"
      );
    } else {
      user = await User.findOne({ password, email }).select(
        "email username phoneNumber _id"
      );
    }
    if (user && !user.isAdmin)
      res.status(200).json({ status: "success", data: user });
    else
      res.status(404).json({
        message: "No user found, please check email(or username) and password",
      });
  } catch (err) {
    res.status(500).json({ status: "fail", message: err.message });
  }
};
exports.loginById = async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await User.findById(userId).select(
      "username email phoneNumber fullName"
    );
    if (!user)
      return res.status(404).json({
        message: "No user found, please check email(or username) and password",
      });
    else res.status(200).json({ status: "success", data: user });
  } catch (err) {
    res.status(500).json({ status: "fail", message: err.message });
  }
};

exports.loginAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ password, username }).select("-password");
    if (user && user.isAdmin)
      res.json({ status: "success", message: "login success", data: user });
    else
      res.status(404).json({
        message: "No user found, please check email(or username) and password",
      });
  } catch (err) {
    res.status(500).json({ status: "fail", message: err.message });
  }
};
exports.loginByIdAdmin = async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await User.findById(userId);
    if (!user)
      return res.status(404).json({
        message: "No user found, please check email(or username) and password",
      });
    if (!user.isAdmin)
      return res.status(403).json({
        message: "Forbidden access",
      });
    else res.status(200).json({ status: "success", data: user });
  } catch (err) {
    res.status(500).json({ status: "fail", message: err.message });
  }
};
exports.getUsers = async (req, res) => {
  try {
    const { userId } = req.body;
    let { page } = req.query;
    if (!page) page = 1;
    const get8Users = (users, page) => {
      return users
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice((page - 1) * 8, page * 8);
    };
    const users = await User.find({ isAdmin: false });
    res
      .status(200)
      .json({
        status: "success",
        data: {
          users: get8Users(users, page),
          totalPage: Math.ceil(users.length / 8),
        },
      });
  } catch (err) {
    res.status(500).json({ status: "fail", message: err.message });
  }
};

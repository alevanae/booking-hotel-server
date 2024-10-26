const Transaction = require("../models/transaction");
const User = require("../models/user");

exports.createUserTransaction = async (req, res) => {
  try {
    const {
      dateStart,
      dateEnd,
      roomNumbers,
      totalPrice,
      payment,
      userId,
      roomTypes,
    } = req.body;
    const { hotelId } = req.params;
    const status = "booked";
    const newTransaction = await Transaction.create({
      dateEnd: new Date(dateEnd),
      dateStart: new Date(dateStart),
      userId,
      hotelId,
      roomTypes,
      payment,
      roomNumbers,
      totalPrice,
      status,
    });
    if (!newTransaction) {
      return res
        .status(500)
        .json({ status: "fail", message: "Transaction creation failed" });
    }
    res.json({ status: "success" });
  } catch (err) {
    res.json({ status: "fail", message: err.message });
  }
};

exports.getUserTransactions = async (req, res) => {
  try {
    const { userId } = req.params;
    const transactions = await Transaction.find({ userId })
      .populate({ path: "hotelId", select: "name -_id" })
      .select("-updatedAt -__v -userId");
    transactions.sort((a, b) => b.createdAt - a.createdAt);
    res.json({ status: "success", data: transactions });
  } catch (err) {
    res.status(400).json({ status: "fail", message: err.message });
  }
};

exports.getUnavailableRoom = async (req, res) => {
  try {
    const { dateStart, dateEnd, hotelId } = req.body;
    const transactions = await Transaction.find();
    const start = new Date(dateStart);
    const end = new Date(dateEnd);
    const filterByHotel = transactions.filter(
      (item) => item.hotelId.toString() === hotelId
    );
    const filterByDate = filterByHotel.filter(
      (item) =>
        (item.dateStart <= start && start <= item.dateEnd) ||
        (item.dateStart <= end && end <= item.dateEnd) ||
        (start <= item.dateStart && item.dateEnd <= end)
    );
    const roomNumbers = filterByDate.reduce((acc, item) => {
      return [...acc, ...item.roomNumbers];
    }, []);
    res.status(200).json({ status: "success", data: roomNumbers });
  } catch (err) {
    res.status(500).json({ status: "fail", message: err.message });
  }
};

// admin
exports.getAllTransactions = async (req, res) => {
  try {
    const { userId } = req.params;
    let { page } = req.query;
    if (!page) page = 1;
    const user = await User.findById(userId);
    if (user.isAdmin) {
      const transactions = await Transaction.find().populate([
        { path: "userId", select: "fullName" },
        { path: "hotelId", select: "name" },
      ]);
      const get8Transactions = (transactions, page) => {
        return transactions
          .sort((a, b) => b.createdAt - a.createdAt)
          .slice((page - 1) * 8, page * 8);
      };
      const users = await User.find();
      const userQty = users.length - 1;
      const transactionsQty = transactions.length;
      const earning = transactions.reduce(
        (acc, transaction) => acc + transaction.totalPrice,
        0
      );
      const monthlyBalance = (now) => {
        const currentMonthTransactions = transactions.filter(
          (transaction) =>
            transaction.createdAt.getMonth() === now.getMonth() &&
            transaction.createdAt.getYear() === now.getYear()
        );
        let currentMonthEarning = 0;
        if (currentMonthTransactions.length > 0)
          currentMonthEarning = currentMonthTransactions.reduce(
            (acc, transaction) => acc + transaction.totalPrice,
            0
          );
        return currentMonthEarning;
      };
      res.json({
        status: "success",
        data: {
          totalPage: Math.ceil(transactions.length / 8),
          transactions: get8Transactions(transactions, page),
          userQty,
          transactionsQty,
          earning,
          thisMonthEarning: monthlyBalance(new Date()),
          userQty,
        },
      });
    } else {
      return res
        .status(403)
        .json({ status: "fail", message: "Your access is not allowed!" });
    }
  } catch (err) {
    res.json({ status: "fail", message: err.message });
  }
};

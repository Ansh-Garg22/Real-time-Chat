// controllers/roomController.js
const User = require("../models/user");

exports.renderChatRoom = async (req, res, next) => {
  try {
    // Retrieve user data from req.user set by verifyToken middleware
    const user = req.user;

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.render("room", { user });
  } catch (error) {
    next(error);
  }
};

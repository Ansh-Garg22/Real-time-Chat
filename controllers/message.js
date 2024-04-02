const Message = require("../models/message");
const Room = require("../models/room");

exports.sendMessage = async function (req, res, next) {
  try {
    const { content, senderId } = req.body;
    const room = await Room.findOne(); // Get the single chat room
    const message = new Message({ content, sender: senderId });
    await message.save();
    // Emit the message to all connected clients in the room
    io.to(room._id.toString()).emit("new-message", message);
    res.status(201).json({ message: "Message sent successfully" });
  } catch (error) {
    next(error);
  }
};exports.getMessages = async function (req, res, next) {
  try {
    // Fetch messages from the database
    const messages = await Message.find()
      .populate("sender", "username") // Populate sender details (e.g., username)
      .sort({ timestamp: -1 }) // Sort messages by timestamp in descending order
      .limit(20); // Limit the number of messages to retrieve to 20

    // Send the messages as a JSON response
    res.status(200).json(messages);
  } catch (error) {
    // Handle errors
    next(error);
  }
};
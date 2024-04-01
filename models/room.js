// models/room.js
const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    default: "Global Chat Room",
  },
});

module.exports = mongoose.model("Room", roomSchema);

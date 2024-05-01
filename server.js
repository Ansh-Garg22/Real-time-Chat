const express = require("express");
const mongoose = require("mongoose");
const http = require("http");
const path = require("path");
const cookieParser = require("cookie-parser");
const Message = require("./models/message");
const socketIo = require("socket.io");
const authRoutes = require("./routes/auth");
const protectedRoutes = require("./routes/protected");
const roomController = require("./controllers/room");
const messageController = require("./controllers/message");
const authMiddleware = require("./middleware/auth");
const app = express();
const server = http.createServer(app);
const io = socketIo(server); // Attach Socket.IO to the HTTP server
const User = require("./models/user");
app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));
app.use(cookieParser());

// Middleware to serve static files
app.use(express.static(__dirname + "/public"));

// Middleware for parsing request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB connection
mongoose.set("strictQuery", false);
mongoose
  .connect(
    "mongodb+srv://Bandar:bandar0123@cluster0.txh1lwj.mongodb.net/chatapp?retryWrites=true&w=majority&appName=Cluster0",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));
// Routes
app.use(express.static("public"));

app.use("/auth", authRoutes);
app.use("/protected", protectedRoutes);
app.get("/chat", authMiddleware.verifyToken, roomController.renderChatRoom);
app.get(
  "/get-messages",
  authMiddleware.verifyToken,
  messageController.getMessages
);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Create the global chat room if it doesn't exist
const Room = require("./models/room");
async function createGlobalChatRoom() {
  try {
    const room = await Room.findOne();
    if (!room) {
      const newRoom = new Room();
      await newRoom.save();
      console.log("Global Chat Room created");
    } else {
      console.log("Global Chat Room already exists");
    }
  } catch (error) {
    console.error("Error creating Global Chat Room:", error);
  }
}

// Call the function to create the global chat room
createGlobalChatRoom();

io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("join-room", async (userId) => {
    try {
      const room = await Room.findOne();
      if (room) {
        socket.join(room._id.toString());
        console.log(`User ${userId} joined room ${room._id}`);
      } else {
        console.error("No chat room found");
      }
    } catch (error) {
      console.error("Error joining room:", error);
    }
  });
  socket.on("send-message", async (data) => {
    const { content, senderId, sendername } = data;
    const room = await Room.findOne();
    const user = await User.findById(senderId);

    const message = new Message({
      content,
      sender: user._id, // Assign the ObjectId reference to the User document
    });
    await message.save();

    io.to(room._id.toString()).emit("new-message", {
      content: message.content,
      sender: {
        _id: user._id, // Use the ObjectId reference
        username: user.username, // Include the username
      },
    });
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});

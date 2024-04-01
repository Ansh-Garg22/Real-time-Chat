const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");

router.get("/protected", authMiddleware.verifyToken, (req, res) => {
  res.status(200).json({ message: "You have access to this protected route" });
});

module.exports = router;

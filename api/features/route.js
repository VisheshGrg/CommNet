const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/auth");

router.get("/protected", authenticateToken, (req, res) => {
  res.status(200).json({ message: "This is a protected route" });
});

router.get("/", (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");

  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );

  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With,content-type"
  );
});

module.exports = router;

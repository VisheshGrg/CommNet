const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/auth");

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

const express = require("express");
const { createLoan } = require("../controllers/loan");
const router = express.Router();

router.post("/loans", createLoan);

module.exports = router;

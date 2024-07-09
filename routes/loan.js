const express = require("express");
const { predictInterestRate, getLoans } = require("../controllers/loan");
const router = express.Router();

router.post("/loans", getLoans);
router.post("/loans", predictInterestRate);

module.exports = router;

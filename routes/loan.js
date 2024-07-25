const express = require("express");
const { predictInterestRate, getLoansByUser } = require("../controllers/loan");
const router = express.Router();

router.post("/loans", getLoansByUser);
router.post("/predict-loans", predictInterestRate);

module.exports = router;

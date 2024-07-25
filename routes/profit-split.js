const express = require("express");
const { predictProfitSplit } = require("../controllers/profit-split");
const router = express.Router();

router.post("/profit-split", predictProfitSplit);

module.exports = router;

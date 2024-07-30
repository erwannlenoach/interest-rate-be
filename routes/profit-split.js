const express = require("express");
const {
  predictProfitSplit,
  getProfitSplitsByUser,
} = require("../controllers/profit-split");
const router = express.Router();

router.post("/profit-split", getProfitSplitsByUser);
router.post("/predict-profit-split", predictProfitSplit);

module.exports = router;

const express = require("express");
const {
  predictProfitSplit,
  getProfitSplitsByUser,
  deleteProfitSplitById,
} = require("../controllers/profit-split");
const router = express.Router();

router.post("/profit-split", getProfitSplitsByUser);
router.post("/predict-profit-split", predictProfitSplit);
router.delete("/profit-split/:id", deleteProfitSplitById);

module.exports = router;

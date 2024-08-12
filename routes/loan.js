const express = require("express");
const {
  predictInterestRate,
  getLoansByUser,
  deleteLoanById,
} = require("../controllers/loan");
const router = express.Router();

router.post("/loans", getLoansByUser);
router.post("/predict-loans", predictInterestRate);
router.delete("/loans/:id", deleteLoanById);

module.exports = router;

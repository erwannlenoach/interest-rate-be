const tf = require("@tensorflow/tfjs-node");
const fs = require("fs");
const path = require("path");
const Loan = require("../models/loans");

const { industrySectors, regions, creditRatings } = require("../constants");

const InterestRateModelPath = "file://../ml/interest_rates/model.json";

class L2 {
  static className = "L2";
  constructor(config) {
    return tf.regularizers.l2(config);
  }
}

async function predictInterestRate(req, res) {
  try {
    tf.serialization.registerClass(L2);

    const model = await tf.loadLayersModel(`file://${InterestRateModelPath}`);

    const loanData = req.body;
    const sectorIndex = industrySectors[loanData.Sector];
    const regionIndex = regions[loanData.Region];
    const creditRatingIndex = creditRatings.indexOf(
      loanData.Assigned_Credit_Rating
    );

    // Prepare input data according to the model's expected features
    const dataML = [
      loanData.Debt_to_Income_Ratio,
      loanData.Loan_to_Value_Ratio,
      loanData.Annual_Income,
      loanData.Loan_Amount,
      loanData.Loan_Term_Years,
      loanData.Subordination,
      loanData.Collateral_Value,
      creditRatingIndex,
      sectorIndex,
      regionIndex,
    ];

    const normalizedData = normalizeData(dataML);

    const dataTensor = tf.tensor2d(
      [normalizedData],
      [1, normalizedData.length]
    );

    const predictions = await model.predict(dataTensor).data();

    const formattedPredictions = Array.from(predictions);
    const loanDataToSave = {
      debt_to_income_ratio: loanData.Debt_to_Income_Ratio,
      loan_to_value_ratio: loanData.Loan_to_Value_Ratio,
      annual_income: loanData.Annual_Income,
      loan_amount: loanData.Loan_Amount,
      collateral_value: loanData.Collateral_Value,
      political_stability_index: regionIndex,
      sector_index: sectorIndex,
      loan_term_years: loanData.Loan_Term_Years,
      company_credit_rating_value: creditRatingIndex,
      subordination: loanData.Subordination,
      interest_rate: formattedPredictions[0],
    };
    res.status(200).json({ prediction: formattedPredictions });
    saveLoan(loanDataToSave);
  } catch (error) {
    console.error("Error creating loan:", error);
    res.status(500).json({ error: error.message });
  }
}

async function saveLoan(loanInformation) {
  try {
    await Loan.create(loanInformation);
    console.log("Loan saved successfully.");
  } catch (error) {
    console.error("Error saving the loan", error);
  }
}

async function getLoans(req, res) {
  try {
    const loans = await Loan.findAll();
    res.status(200).json({ loans });
  } catch (error) {
    console.error("Error getting loans:", error);
  }
}

// Helper function

function normalizeData(data) {
  const scalerPath = path.join(__dirname, "../ml/interest_rates/scaler.json");

  const scaler = JSON.parse(fs.readFileSync(scalerPath, "utf8"));
  const mean = scaler.mean;
  const std = scaler.std;

  return data.map((value, index) => {
    return (value - mean[index]) / std[index];
  });
}

module.exports = { predictInterestRate, getLoans };

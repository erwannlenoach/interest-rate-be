const Loan = require("../models/loans");
const tf = require("@tensorflow/tfjs-node");

const path = require("path");
const { industry_sectors, regions, credit_ratings } = require("../constants");

async function createLoan(req, res) {
  try {
    class L2 {
      static className = "L2";
      constructor(config) {
        return tf.regularizers.l2(config);
      }
    }

    tf.serialization.registerClass(L2);

    const modelPath = "file://../ml/model.json";
    const model = await tf.loadLayersModel(`file://${modelPath}`);

    const loanData = req.body;
    const sectorIndex = industry_sectors[loanData.Sector];
    const regionIndex = regions[loanData.Region];
    const creditRatingIndex = credit_ratings.indexOf(
      loanData.Assigned_Credit_Rating
    );

    const fs = require("fs");

    const path = require("path");

    const scalerPath = path.join(__dirname, "../ml/scaler.json"); 

    const scaler = JSON.parse(fs.readFileSync(scalerPath, "utf8"));
    const mean = scaler.mean;
    const std = scaler.std;

    /**
     * Fonction pour normaliser un tableau de données
     * @param {Array} data - Tableau de données à normaliser
     * @returns {Array} Données normalisées
     */
    function normalizeData(data) {
      return data.map((value, index) => {
        return (value - mean[index]) / std[index];
      });
    }

    // Prepare input data according to the model's expected features
    const inputData = [
      parseFloat(loanData.Debt_to_Income_Ratio),
      parseFloat(loanData.Loan_to_Value_Ratio),
      parseFloat(loanData.Annual_Income),
      parseFloat(loanData.Loan_Amount),
      parseFloat(loanData.Loan_Term_Years),
      parseFloat(loanData.Subordination),
      parseFloat(loanData.Collateral_Value),
      creditRatingIndex,
      sectorIndex,
      regionIndex,
    ];

    const normalizedData = normalizeData(inputData);

    const inputTensor = tf.tensor2d(
      [normalizedData],
      [1, normalizedData.length]
    );

    const predictions = await model.predict(inputTensor).data();

    const formattedPredictions = Array.from(predictions); 
    res.status(200).json({ prediction: formattedPredictions });
  } catch (error) {
    console.error("Error creating loan:", error);
    res.status(500).json({ error: error.message });
  }
}

async function getLoans() {
  try {
    const loans = await Loan.findAll();
    console.log(loans);
  } catch (error) {
    console.error("Error getting loans:", error);
  }
}

async function populateLoans() {
  const loansData = [
    {
      debt_to_income_ratio: 0.4,
      loan_to_value_ratio: 0.7,
      annual_income: 60000,
      loan_amount: 20000,
      collateral_value: 25000,
      political_stability_index: 3,
      sector_index: 2,
      loan_term_years: 5,
      company_credit_rating_value: 7,
      subordination: 1,
      interest_rate: 5,
    },
    {
      debt_to_income_ratio: 0.3,
      loan_to_value_ratio: 0.6,
      annual_income: 80000,
      loan_amount: 30000,
      collateral_value: 40000,
      political_stability_index: 4,
      sector_index: 3,
      loan_term_years: 10,
      company_credit_rating_value: 8,
      subordination: 2,
      interest_rate: 4.5,
    },
    {
      debt_to_income_ratio: 0.2,
      loan_to_value_ratio: 0.5,
      annual_income: 100000,
      loan_amount: 40000,
      collateral_value: 50000,
      political_stability_index: 5,
      sector_index: 4,
      loan_term_years: 15,
      company_credit_rating_value: 9,
      subordination: 3,
      interest_rate: 4,
    },
    {
      debt_to_income_ratio: 0.5,
      loan_to_value_ratio: 0.8,
      annual_income: 50000,
      loan_amount: 15000,
      collateral_value: 20000,
      political_stability_index: 2,
      sector_index: 1,
      loan_term_years: 3,
      company_credit_rating_value: 6,
      subordination: 1,
      interest_rate: 5.5,
    },
    {
      debt_to_income_ratio: 0.4,
      loan_to_value_ratio: 0.7,
      annual_income: 75000,
      loan_amount: 25000,
      collateral_value: 30000,
      political_stability_index: 3,
      sector_index: 2,
      loan_term_years: 7,
      company_credit_rating_value: 7.5,
      subordination: 2,
      interest_rate: 5.2,
    },
  ];

  try {
    for (const loanData of loansData) {
      await Loan.create(loanData);
    }
    console.log("Loans populated successfully.");
  } catch (error) {
    console.error("Error populating loans:", error);
  }
}

module.exports = { createLoan, populateLoans, getLoans };

const tf = require("@tensorflow/tfjs-node");
const fs = require("fs");
const path = require("path");
const Loan = require("../models/loans");
const User = require("../models/users");

const {
  industryInterestRates,
  regionsInterestRates,
  creditRatings,
} = require("../constants");

const InterestRateModelPath = path.resolve(
  __dirname,
  "../ml/interest_rates/model.json"
);

class L2 {
  static className = "L2";
  constructor(config) {
    return tf.regularizers.l2(config);
  }
}

async function predictInterestRate(req, res) {
  try {
    tf.serialization.registerClass(L2);

    const model = await tf.loadGraphModel(`file://${InterestRateModelPath}`);

    const data = req.body;
    const sectorIndex = industryInterestRates[data.formData.Sector];
    const regionIndex = regionsInterestRates[data.formData.Region];
    const creditRatingIndex = creditRatings.indexOf(
      data.formData.Assigned_Credit_Rating
    );

    const dataML = [
      data.formData.Debt_to_Income_Ratio,
      data.formData.Loan_to_Value_Ratio,
      data.formData.Annual_Income,
      data.formData.Loan_Amount,
      data.formData.Loan_Term_Years,
      data.formData.Subordination,
      data.formData.Collateral_Value,
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
    const loanUser = await getUserbyUsername(data.username);

    const dataToSave = {
      debt_to_income_ratio: data.formData.Debt_to_Income_Ratio,
      loan_to_value_ratio: data.formData.Loan_to_Value_Ratio,
      annual_income: data.formData.Annual_Income,
      loan_amount: data.formData.Loan_Amount,
      collateral_value: data.formData.Collateral_Value,
      political_stability_index: regionIndex,
      sector_index: sectorIndex,
      loan_term_years: data.formData.Loan_Term_Years,
      company_credit_rating_value: creditRatingIndex,
      subordination: data.formData.Subordination,
      interest_rate: formattedPredictions[0],
      UserId: loanUser.id,
    };

    res.status(200).json({ prediction: formattedPredictions });
    saveLoan(dataToSave);
  } catch (error) {
    console.error("Error creating loan:", error);
    res.status(500).json({ error: error.message });
  }
}

async function saveLoan(loanInformation) {
  console.log("loan info", loanInformation)
  try {
    await Loan.create(loanInformation);
  } catch (error) {
    console.error("Error saving the loan", error);
  }
}

const getLoansByUser = async (req, res) => {
  try {
    const { userId } = req.body;
    const loans = await Loan.findAll({ where: { UserId: userId } });
    res.status(200).json({ loans });
  } catch (error) {
    console.error("Error getting loans by user:", error);
    res.status(500).json({ error: error.message });
  }
};

const deleteLoanById = async (req, res) => {
  try {
    console.log("requete", req.params);
    const loanId = req.params.id;
    await Loan.destroy({ where: { id: loanId } });
    res.status(200).json({ message: "Loan deleted successfully." });
  } catch (error) {
    console.error("Error deleting loan:", error);
    res.status(500).json({ error: "Failed to delete loan." });
  }
};

function normalizeData(data) {
  const scalerPath = path.join(__dirname, "../ml/interest_rates/scaler.json");

  const scaler = JSON.parse(fs.readFileSync(scalerPath, "utf8"));
  const mean = scaler.mean;
  const std = scaler.std;

  return data.map((value, index) => {
    return (value - mean[index]) / std[index];
  });
}

async function getUserbyUsername(username) {
  try {
    const user = await User.findOne({ where: { username } });
    return user;
  } catch (error) {
    console.error("Error getting user:", error);
  }
}

module.exports = { predictInterestRate, getLoansByUser, deleteLoanById };

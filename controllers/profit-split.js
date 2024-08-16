const tf = require("@tensorflow/tfjs-node");
const fs = require("fs");
const path = require("path");
const ProfitSplit = require("../models/profit-split");
const User = require("../models/users");

const { industriesProfitSplit, functionsProfitSplit } = require("../constants");

const profitSplitModelPath =
  "file://" + path.resolve(__dirname, "../ml/profit_split/model.json");
let model;

const loadModel = async () => {
  if (!model) {
    model = await tf.loadGraphModel(profitSplitModelPath);
  }
};

const normalizeData = (data) => {
  const scalerPath = path.join(__dirname, "../ml/profit_split/scaler.json");
  const scaler = JSON.parse(fs.readFileSync(scalerPath, "utf8"));
  const mean = scaler.mean;
  const std = scaler.std;

  return data.map((value, index) => {
    return (value - mean[index]) / std[index];
  });
};

// Function to calculate function weight based on industry
const calculateFunctionWeight = (industry, func) => {
  const industryWeights = {
    'manufacturing': 1.2,
    'services': 1.0,
    'technology': 1.3,
    'retail': 0.9,
    'finance': 1.4,
    'healthcare': 1.3,
    'energy': 1.5,
    'transportation': 1.1
  };

  const baseFunctionWeights = {
    'R&D': 5,
    'marketing': 3,
    'sales': 4,
    'administration': 2,
    'logistics': 3,
    'holding': 2,
    'manufacturing': 4
  };

  const functionImportanceByIndustry = {
    'manufacturing': {'R&D': 3, 'marketing': 2, 'sales': 4, 'administration': 2, 'logistics': 5, 'holding': 2, 'manufacturing': 5},
    'services': {'R&D': 2, 'marketing': 3, 'sales': 5, 'administration': 3, 'logistics': 2, 'holding': 3, 'manufacturing': 2},
    'technology': {'R&D': 6, 'marketing': 4, 'sales': 4, 'administration': 2, 'logistics': 3, 'holding': 2, 'manufacturing': 3},
    'retail': {'R&D': 2, 'marketing': 5, 'sales': 5, 'administration': 2, 'logistics': 3, 'holding': 2, 'manufacturing': 3},
    'finance': {'R&D': 3, 'marketing': 3, 'sales': 5, 'administration': 4, 'logistics': 2, 'holding': 5, 'manufacturing': 2},
    'healthcare': {'R&D': 6, 'marketing': 3, 'sales': 3, 'administration': 2, 'logistics': 5, 'holding': 3, 'manufacturing': 4},
    'energy': {'R&D': 4, 'marketing': 2, 'sales': 3, 'administration': 3, 'logistics': 6, 'holding': 3, 'manufacturing': 5},
    'transportation': {'R&D': 3, 'marketing': 2, 'sales': 3, 'administration': 3, 'logistics': 6, 'holding': 2, 'manufacturing': 4}
  };

  return functionImportanceByIndustry[industry][func] * industryWeights[industry];
};

const predictProfitSplit = async (req, res) => {
  try {
    await loadModel();

    const inputData = req.body.formData;
    const email = req.body.email;

    // Calculate function weights
    const hq_function_weight = calculateFunctionWeight(inputData.hq_industry, inputData.hq_function);
    const subs_function_weight = calculateFunctionWeight(inputData.subs_industry, inputData.subs_function);

    // Calculate additional features (ratios)
    const hq_subs_profit_ratio = inputData.subs_profit !== 0 
        ? inputData.hq_profit / inputData.subs_profit 
        : 0;
    const hq_subs_assets_ratio = inputData.subs_assets !== 0 
        ? inputData.hq_assets / inputData.subs_assets 
        : 0;

    // Prepare the data for prediction
    const dataML = [
      inputData.hq_revenue,
      inputData.hq_cost,
      inputData.hq_profit,
      inputData.hq_assets,
      inputData.hq_liabilities,
      inputData.subs_revenue,
      inputData.subs_cost,
      inputData.subs_profit,
      inputData.subs_assets,
      inputData.subs_liabilities,
      hq_subs_profit_ratio,  // Add calculated ratio
      hq_subs_assets_ratio,  // Add calculated ratio
      hq_function_weight,    // Add calculated function weight for HQ
      subs_function_weight   // Add calculated function weight for Subsidiary
    ];

    const normalizedData = normalizeData(dataML);
    const dataTensor = tf.tensor2d(
      [normalizedData],
      [1, normalizedData.length]
    );

    const predictions = await model.predict(dataTensor).data();
    const formattedPredictions = Array.from(predictions);
    const profitSplitUser = await getUserByEmail(email);

    const profitSplitData = {
      ...inputData,
      UserId: profitSplitUser.id,
      profit_allocation_key: formattedPredictions[0],
    };

    await saveProfitSplit(profitSplitData);

    res.status(200).json({ prediction: formattedPredictions[0] });
  } catch (error) {
    console.error("Error predicting profit split:", error);
    res.status(500).json({ error: error.message });
  }
};

const saveProfitSplit = async (profitSplitData) => {
  try {
    await ProfitSplit.create(profitSplitData);
    console.log("Profit split saved successfully.");
  } catch (error) {
    console.error("Error saving the profit split", error);
  }
};

const getProfitSplitsByUser = async (req, res) => {
  try {
    const { userId } = req.body;
    const profitSplits = await ProfitSplit.findAll({
      where: { UserId: userId },
    });
    res.status(200).json({ profitSplits });
  } catch (error) {
    console.error("Error getting profit splits by user:", error);
    res.status(500).json({ error: error.message });
  }
};

const deleteProfitSplitById = async (req, res) => {
  try {
    const profitSplitId = req.params.id;
    await ProfitSplit.destroy({ where: { id: profitSplitId } });
    res.status(200).json({ message: "Profit Split deleted successfully." });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete profit split." });
  }
};

async function getUserByEmail(email) {
  try {
    const user = await User.findOne({ where: { email } });
    return user;
  } catch (error) {
    console.error("Error getting user:", error);
  }
}

module.exports = {
  predictProfitSplit,
  saveProfitSplit,
  getProfitSplitsByUser,
  deleteProfitSplitById,
};

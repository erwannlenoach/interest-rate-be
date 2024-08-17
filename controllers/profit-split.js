const tf = require("@tensorflow/tfjs-node");
const fs = require("fs");
const path = require("path");
const ProfitSplit = require("../models/profit-split");
const User = require("../models/users");

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
    manufacturing: 1.2,
    services: 1.0,
    technology: 1.3,
    retail: 0.9,
    finance: 1.4,
    healthcare: 1.3,
    energy: 1.5,
    transportation: 1.1,
  };

  const baseFunctionWeights = {
    "R&D": 5,
    marketing: 3,
    sales: 4,
    administration: 2,
    logistics: 3,
    holding: 2,
    manufacturing: 4,
    financing: 5,
    supply_chain: 4,
  };

  const functionImportanceByIndustry = {
    manufacturing: {
      "R&D": 3,
      marketing: 2,
      sales: 4,
      administration: 2,
      logistics: 5,
      holding: 2,
      manufacturing: 5,
      financing: 2,
      supply_chain: 5,
    },
    services: {
      "R&D": 2,
      marketing: 3,
      sales: 5,
      administration: 3,
      logistics: 2,
      holding: 3,
      manufacturing: 2,
      financing: 4,
      supply_chain: 3,
    },
    technology: {
      "R&D": 6,
      marketing: 4,
      sales: 4,
      administration: 2,
      logistics: 3,
      holding: 2,
      manufacturing: 3,
      financing: 3,
      supply_chain: 4,
    },
    retail: {
      "R&D": 2,
      marketing: 5,
      sales: 5,
      administration: 2,
      logistics: 3,
      holding: 2,
      manufacturing: 3,
      financing: 3,
      supply_chain: 5,
    },
    finance: {
      "R&D": 3,
      marketing: 3,
      sales: 5,
      administration: 4,
      logistics: 2,
      holding: 5,
      manufacturing: 2,
      financing: 6,
      supply_chain: 3,
    },
    healthcare: {
      "R&D": 6,
      marketing: 3,
      sales: 3,
      administration: 2,
      logistics: 5,
      holding: 3,
      manufacturing: 4,
      financing: 4,
      supply_chain: 4,
    },
    energy: {
      "R&D": 4,
      marketing: 2,
      sales: 3,
      administration: 3,
      logistics: 6,
      holding: 3,
      manufacturing: 5,
      financing: 5,
      supply_chain: 6,
    },
    transportation: {
      "R&D": 3,
      marketing: 2,
      sales: 3,
      administration: 3,
      logistics: 6,
      holding: 2,
      manufacturing: 4,
      financing: 4,
      supply_chain: 5,
    },
  };

  return (
    functionImportanceByIndustry[industry][func] * industryWeights[industry]
  );
};

// Function to calculate risk based on function and industry
const calculateRiskFactor = (industry, func) => {
  const functionRiskFactors = {
    "R&D": 1.4,
    marketing: 1.2,
    sales: 1.3,
    administration: 1.1,
    logistics: 1.5,
    holding: 1.2,
    manufacturing: 1.4,
    financing: 1.6,
    supply_chain: 1.5,
  };

  const industryRiskMultipliers = {
    manufacturing: 1.3,
    services: 1.0,
    technology: 1.5,
    retail: 1.2,
    finance: 1.4,
    healthcare: 1.6,
    energy: 1.7,
    transportation: 1.3,
  };

  return functionRiskFactors[func] * industryRiskMultipliers[industry];
};

const safeRatio = (numerator, denominator, defaultValue = 1) => {
  return denominator === 0 ? defaultValue : numerator / denominator;
};

const predictProfitSplit = async (req, res) => {
  try {
    await loadModel();

    const inputData = req.body.formData;
    const email = req.body.email;

    // Calculate function weights
    const hq_function_weight = calculateFunctionWeight(
      inputData.hq_industry,
      inputData.hq_function
    );
    const subs_function_weight = calculateFunctionWeight(
      inputData.subs_industry,
      inputData.subs_function
    );

    // Calculate risk factors
    const hq_risk_factor = calculateRiskFactor(
      inputData.hq_industry,
      inputData.hq_function
    );
    const subs_risk_factor = calculateRiskFactor(
      inputData.subs_industry,
      inputData.subs_function
    );

    // Calculate shared risk: If HQ and Subs share a function, average their risks
    const shared_risk =
      inputData.hq_function === inputData.subs_function
        ? (hq_risk_factor + subs_risk_factor) / 2
        : hq_risk_factor + subs_risk_factor;

    // Calculate additional features (ratios) and apply capping logic
    const ratioCap = 10;
    const revenue_ratio = Math.min(
      Math.max(
        safeRatio(inputData.hq_revenue, inputData.subs_revenue),
        1 / ratioCap
      ),
      ratioCap
    );
    const cost_ratio = Math.min(
      Math.max(safeRatio(inputData.hq_cost, inputData.subs_cost), 1 / ratioCap),
      ratioCap
    );
    const profit_ratio = Math.min(
      Math.max(
        safeRatio(inputData.hq_profit, inputData.subs_profit),
        1 / ratioCap
      ),
      ratioCap
    );
    const assets_ratio = Math.min(
      Math.max(
        safeRatio(inputData.hq_assets, inputData.subs_assets),
        1 / ratioCap
      ),
      ratioCap
    );
    const liabilities_ratio = Math.min(
      Math.max(
        safeRatio(inputData.hq_liabilities, inputData.subs_liabilities),
        1 / ratioCap
      ),
      ratioCap
    );

    // Prepare the data for prediction, including the calculated risk factors and shared risk
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
      hq_risk_factor,
      subs_risk_factor,
      shared_risk,
      revenue_ratio,
      cost_ratio,
      profit_ratio,
      assets_ratio,
      liabilities_ratio,
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

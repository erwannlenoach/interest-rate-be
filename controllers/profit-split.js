const tf = require("@tensorflow/tfjs-node");
const fs = require("fs");
const path = require("path");
const ProfitSplit = require("../models/profit-split");
const { industries, functions } = require("../constants");

const profitSplitModelPath = "file://" + path.resolve(__dirname, "../ml/profit_split/model.json");
let model;

const loadModel = async () => {
  if (!model) {
    model = await tf.loadGraphModel(profitSplitModelPath);  }
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

// One-hot encode categorical variables
const oneHotEncode = (value, categories) => {
  return categories.map(category => (category === value ? 1 : 0));
};

const hqIndustryCategories = industries;
const subsIndustryCategories = industries;
const hqFunctionCategories = functions;
const subsFunctionCategories = functions;

const predictProfitSplit = async (req, res) => {
  try {
    await loadModel();

    const inputData = req.body;

    // Prepare input data according to the model's expected features
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
      inputData.hq_functions,
      inputData.subs_functions,
      ...oneHotEncode(inputData.hq_industry, hqIndustryCategories),
      ...oneHotEncode(inputData.subs_industry, subsIndustryCategories),
      ...oneHotEncode(inputData.hq_function, hqFunctionCategories),
      ...oneHotEncode(inputData.subs_function, subsFunctionCategories),
    ];

    const normalizedData = normalizeData(dataML);
    const dataTensor = tf.tensor2d([normalizedData], [1, normalizedData.length]);

    const predictions = await model.predict(dataTensor).data();
    const formattedPredictions = Array.from(predictions);

    const profitSplitData = {
      ...inputData,
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

const generateProfitSplits = async () => {
  try {
    for (const profitSplit of mockProfitSplits) {
      await ProfitSplit.create(profitSplit);
    }
    console.log("Profit splits populated successfully.");
  } catch (error) {
    console.error("Error populating profit splits:", error);
  }
};

const getProfitSplits = async (req, res) => {
  try {
    const profitSplits = await ProfitSplit.findAll();
    res.status(200).json({ profitSplits });
  } catch (error) {
    console.error("Error getting profit splits:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  predictProfitSplit,
  generateProfitSplits,
  saveProfitSplit,
  getProfitSplits,
};

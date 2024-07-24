const { DataTypes, Model } = require("sequelize");
const sequelize = require("../db");
const User = require("./users");

class ProfitSplit extends Model {}

ProfitSplit.init(
  {
    hq_revenue: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    hq_cost: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    hq_profit: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    hq_assets: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    hq_liabilities: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    subs_revenue: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    subs_cost: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    subs_profit: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    subs_assets: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    subs_liabilities: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    hq_functions: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    subs_functions: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    hq_industry: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    subs_industry: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    hq_function: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    subs_function: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    profit_allocation_key: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "profit_splits",
    modelName: "ProfitSplit",
  }
);

User.hasMany(ProfitSplit, { as: 'profit_splits' });
ProfitSplit.belongsTo(User);

module.exports = ProfitSplit;

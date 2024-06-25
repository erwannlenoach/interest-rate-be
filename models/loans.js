const { DataTypes, Model } = require("sequelize");
const sequelize = require("../db");
const User = require("./users");

class Loan extends Model {}

Loan.init(
  {
    debt_to_income_ratio: {
      type: DataTypes.FLOAT,
    },
    loan_to_value_ratio: {
      type: DataTypes.FLOAT,
    },
    annual_income: {
      type: DataTypes.FLOAT,
    },
    loan_amount: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    collateral_value: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    political_stability_index: {
      type: DataTypes.INTEGER,
    },
    sector_index: {
      type: DataTypes.INTEGER,
    },
    loan_term_years: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    company_credit_rating_value: {
      type: DataTypes.FLOAT,
    },
    subordination: {
      type: DataTypes.INTEGER,
    },
    interest_rate: {
      type: DataTypes.FLOAT,
    },
    userId: {
      type: DataTypes.INTEGER,
      references: {
        model: User,
        key: "id",
      },
    },
  },
  {
    sequelize,
    tableName: "loans",
    modelName: "Loan",
  }
);

User.hasMany(Loan, { foreignKey: "userId" });
Loan.belongsTo(User, { foreignKey: "userId" });

module.exports = Loan;

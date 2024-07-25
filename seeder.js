const bcrypt = require("bcryptjs");
const User = require("./models/users");
const Loan = require("./models/loans");  
const ProfitSplit = require("./models/profit-split");  


const { defaultUsers, mockLoans, mockProfitSplits } = require("./constants");

const sequelize = require("./db");

async function generateUsers() {
  try {
    for (const user of defaultUsers) {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      await User.create({
        email: user.email,
        username: user.username,
        password: hashedPassword,
      });
    }
  } catch (error) {
    console.error("Error creating default users:", error);
  } 
}

  async function generateProfitSplits () {
  try {
    for (const profitSplit of mockProfitSplits) {
      await ProfitSplit.create(profitSplit);
    }
    console.log("Profit splits populated successfully.");
  } catch (error) {
    console.error("Error populating profit splits:", error);
  }
}

async function generateLoans() {
  try {
    for (const loan of mockLoans) {
      await Loan.create(loan);
    }
    console.log("Loans populated successfully.");
  } catch (error) {
    console.error("Error populating loans:", error);
  }
}

module.exports = { generateUsers, generateLoans, generateProfitSplits};

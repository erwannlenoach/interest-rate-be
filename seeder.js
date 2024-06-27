const bcrypt = require("bcryptjs");
const User = require("./models/users");
const Loan = require("./models/loans");  

const { defaultUsers, mockLoans } = require("./constants");

const sequelize = require("./db");

async function generateUsers() {
  try {
    await sequelize.sync({ force: true });
    for (const user of defaultUsers) {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      await User.create({
        email: user.email,
        username: user.username,
        password: hashedPassword,
      });
    }
    console.log("Default users have been created.");
  } catch (error) {
    console.error("Error creating default users:", error);
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

module.exports = { generateUsers, generateLoans };

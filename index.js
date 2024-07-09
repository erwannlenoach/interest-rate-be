const Loan = require("./models/loans");
const User = require("./models/users");

const sequelize = require("./db");
const { generateUsers, generateLoans } = require("./seeder");
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const bodyParser = require("body-parser");
const loanRoutes = require("./routes/loan");
const userRoutes = require("./routes/users");

const app = express();
const port = 8800;

app.use(bodyParser.json());

app.use("/api", loanRoutes);
app.use("/api", userRoutes);
app.options("*", cors()); // Preflight requests

async function connectDB() {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
}

async function init() {
  await connectDB();
  if(User.count = 0){await generateUsers()};
  if(Loan.count = 0){await generateLoans()};
  try {
    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  } catch (error) {
    console.error("Unable to launch the server", error);
  }
}

init();

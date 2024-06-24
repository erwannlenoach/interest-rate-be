const Loan = require("./models/loans");
const User = require("./models/users");

const sequelize = require("./db");
const { populateLoans } = require("./controllers/loan");
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
const loanRoutes = require("./routes/loan");
const userRoutes = require("./routes/users");

const app = express();
const port = 8800;
const secretKey = "your_secret_key";

app.use(bodyParser.json());
app.use("/api", loanRoutes);
app.use("/api", userRoutes);

async function connectDB() {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    console.log("sync");
    await populateLoans();
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
}

async function init() {
  await connectDB();
  try {
    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  } catch (error) {
    console.error("Unable to launch the server", error);
  }
}

init();

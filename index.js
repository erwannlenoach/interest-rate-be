const sequelize = require("./db");
const { createLoan, populateLoans } = require("./controllers/loan");
const express = require("express");
const bodyParser = require("body-parser");
const loanRoutes = require("./routes/loan");
const app = express();
const port = 8800;

app.use(bodyParser.json());
app.use(express.json());

app.use("/api", loanRoutes);

async function connectDB() {
  try {
    await sequelize.authenticate();
    console.log("Connection has been established successfully.");
    await sequelize.sync({ force: true });
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
  app.post("/loans", createLoan);
}

init();

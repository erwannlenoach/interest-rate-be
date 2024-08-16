const Loan = require("./models/loans");
const User = require("./models/users");
const ProfitSplit = require("./models/profit-split");

const sequelize = require("./db");
const {
  generateUsers,
  generateLoans,
  generateProfitSplits,
} = require("./seeder");
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const loanRoutes = require("./routes/loan");
const profitSplitRoutes = require("./routes/profit-split");
const userRoutes = require("./routes/users");

const app = express();
const port = process.env.PORT || 8800;

app.use(bodyParser.json());

const isProduction = process.env.NODE_ENV === "production";

const corsOptions = {
  origin: isProduction ? "https://www.nostratp.com" : "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

app.use(cors(corsOptions));

app.use("/api", loanRoutes);
app.use("/api", userRoutes);
app.use("/api", profitSplitRoutes);

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

  const profitSplitCount = await ProfitSplit.count();
  const userCount = await User.count();
  const loanCount = await Loan.count();

  if (userCount === 0) {
    await generateUsers();
  }
  if (profitSplitCount === 0) {
    await generateProfitSplits();
  }
  if (loanCount === 0) {
    await generateLoans();
  }

  try {
    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  } catch (error) {
    console.error("Unable to launch the server", error);
  }
}

init();

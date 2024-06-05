const Loan = require('../models/loans');

async function createLoan(req, res) {
  try {
    const loanData = req.body;
    const loan = await Loan.create(loanData);
    res.status(201).json(loan);
  } catch (error) {
    console.error("Error creating loan:", error);
    res.status(500).json({ error: error.message });
  }
}

async function populateLoans() {
  const loansData = [
    { debt_to_income_ratio: 0.4, loan_to_value_ratio: 0.7, annual_income: 60000, loan_amount: 20000, collateral_value: 25000, political_stability_index: 3, sector_index: 2, loan_term_years: 5, company_credit_rating_value: 7, subordination: 1, interest_rate: 5 },
    { debt_to_income_ratio: 0.3, loan_to_value_ratio: 0.6, annual_income: 80000, loan_amount: 30000, collateral_value: 40000, political_stability_index: 4, sector_index: 3, loan_term_years: 10, company_credit_rating_value: 8, subordination: 2, interest_rate: 4.5 },
    { debt_to_income_ratio: 0.2, loan_to_value_ratio: 0.5, annual_income: 100000, loan_amount: 40000, collateral_value: 50000, political_stability_index: 5, sector_index: 4, loan_term_years: 15, company_credit_rating_value: 9, subordination: 3, interest_rate: 4 },
    { debt_to_income_ratio: 0.5, loan_to_value_ratio: 0.8, annual_income: 50000, loan_amount: 15000, collateral_value: 20000, political_stability_index: 2, sector_index: 1, loan_term_years: 3, company_credit_rating_value: 6, subordination: 1, interest_rate: 5.5 },
    { debt_to_income_ratio: 0.4, loan_to_value_ratio: 0.7, annual_income: 75000, loan_amount: 25000, collateral_value: 30000, political_stability_index: 3, sector_index: 2, loan_term_years: 7, company_credit_rating_value: 7.5, subordination: 2, interest_rate: 5.2 },
  ];

  try {
    for (const loanData of loansData) {
      await Loan.create(loanData);
    }
    console.log('Loans populated successfully.');
  } catch (error) {
    console.error("Error populating loans:", error);
  }
}

module.exports = { createLoan, populateLoans };

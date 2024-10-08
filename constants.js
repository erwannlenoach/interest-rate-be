const industryInterestRates = {
  "Utilities": 6,
  "Healthcare": 5,
  "Telecommunications": 4,
  "Consumer Goods": 3,
  "Technology": 3,
  "Manufacturing": 3,
  "Finance": 2,
  "Retail": 2,
  "Agriculture": 2,
  "Transportation": 2,
  "Real Estate": 1,
  "Energy": 1,
};

const regionsInterestRates = {
  "Northern America": 6,
  "Northern Europe": 6,
  "Oceania": 5,
  "Western Europe": 4,
  "Southern Europe": 4,
  "East Asia": 5,
  "South-East Asia": 3,
  "South Asia": 3,
  "Central Asia": 3,
  "Eastern Europe": 3,
  "North Africa": 3,
  "Southern Africa": 3,
  "South America": 3,
  "Middle East": 3,
  "Central America": 2,
  "East Africa": 2,
  "West Africa": 2,
};

const creditRatings = [
  "Aaa",
  "Aa1",
  "Aa2",
  "Aa3",
  "A1",
  "A2",
  "A3",
  "Baa1",
  "Baa2",
  "Baa3",
  "Ba1",
  "Ba2",
  "Ba3",
  "B1",
  "B2",
  "B3",
  "Caa1",
  "Caa2",
  "Caa3",
  "Ca",
  "C",
];

const defaultUsers = [
  { email: "user1@example.com", username: "user1", password: "password1" },
  { email: "user2@example.com", username: "user2", password: "password2" },
  { email: "user3@example.com", username: "user3", password: "password3" },
  { email: "user4@example.com", username: "user4", password: "password4" },
  { email: "user5@example.com", username: "user5", password: "password5" },
  { email: "user6@example.com", username: "user6", password: "password6" },
  { email: "user7@example.com", username: "user7", password: "password7" },
  { email: "user8@example.com", username: "user8", password: "password8" },
  { email: "user9@example.com", username: "user9", password: "password9" },
  { email: "user10@example.com", username: "user10", password: "password10" },
];

const mockLoans = [
  {
    debt_to_income_ratio: 0.4,
    loan_to_value_ratio: 0.7,
    annual_income: 60000,
    loan_amount: 20000,
    collateral_value: 25000,
    political_stability_index: 3,
    sector_index: 2,
    loan_term_years: 5,
    company_credit_rating_value: 7,
    subordination: 1,
    interest_rate: 5,
    UserId: 1,
  },
  {
    debt_to_income_ratio: 0.3,
    loan_to_value_ratio: 0.6,
    annual_income: 80000,
    loan_amount: 30000,
    collateral_value: 40000,
    political_stability_index: 4,
    sector_index: 3,
    loan_term_years: 10,
    company_credit_rating_value: 8,
    subordination: 2,
    interest_rate: 4.5,
    UserId: 1,
  },
  {
    debt_to_income_ratio: 0.2,
    loan_to_value_ratio: 0.5,
    annual_income: 100000,
    loan_amount: 40000,
    collateral_value: 50000,
    political_stability_index: 5,
    sector_index: 4,
    loan_term_years: 15,
    company_credit_rating_value: 9,
    subordination: 3,
    interest_rate: 4,
    UserId: 1,
  },
  {
    debt_to_income_ratio: 0.5,
    loan_to_value_ratio: 0.8,
    annual_income: 50000,
    loan_amount: 15000,
    collateral_value: 20000,
    political_stability_index: 2,
    sector_index: 1,
    loan_term_years: 3,
    company_credit_rating_value: 6,
    subordination: 1,
    interest_rate: 5.5,
    UserId: 1,
  },
  {
    debt_to_income_ratio: 0.4,
    loan_to_value_ratio: 0.7,
    annual_income: 75000,
    loan_amount: 25000,
    collateral_value: 30000,
    political_stability_index: 3,
    sector_index: 2,
    loan_term_years: 7,
    company_credit_rating_value: 7.5,
    subordination: 2,
    interest_rate: 5.2,
    UserId: 1,
  },
];

const industriesProfitSplit = [
  "manufacturing",
  "services",
  "technology",
  "retail",
  "finance",
  "healthcare",
  "energy",
  "transportation",
];

const functionsProfitSplit = [
  "manufacturing",
  "R&D",
  "marketing",
  "sales",
  "administration",
  "logistics",
  "holding",
];

const mockProfitSplits = [
  {
    hq_revenue: 1000000,
    hq_cost: 700000,
    hq_profit: 300000,
    hq_assets: 1200000,
    hq_liabilities: 800000,
    subs_revenue: 500000,
    subs_cost: 300000,
    subs_profit: 200000,
    subs_assets: 600000,
    subs_liabilities: 400000,
    hq_functionsProfitSplit: 1,
    subs_functionsProfitSplit: 2,
    hq_industry: "manufacturing",
    subs_industry: "services",
    hq_function: "manufacturing",
    subs_function: "R&D",
    profit_allocation_key: 0.6,
    UserId: 1,
  },
];

module.exports = {
  industriesProfitSplit,
  functionsProfitSplit,
  mockProfitSplits,
  industryInterestRates,
  regionsInterestRates,
  creditRatings,
  defaultUsers,
  mockLoans,
};

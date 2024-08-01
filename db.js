const { Sequelize } = require('sequelize');
require('dotenv').config();

console.log('DATABASE_URL:', process.env.DATABASE_URL); // Add this line to check


const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  protocol: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  }
});

module.exports = sequelize;

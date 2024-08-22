'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('loans', 'sector', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('loans', 'region', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('loans', 'sector');
    await queryInterface.removeColumn('loans', 'region');
  }
};


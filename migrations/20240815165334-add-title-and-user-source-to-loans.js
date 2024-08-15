'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('loans', 'title', {
      type: Sequelize.STRING,
    });
    await queryInterface.addColumn('loans', 'user_source', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('loans', 'title');
    await queryInterface.removeColumn('loans', 'user_source');
  }
};

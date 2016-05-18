'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.createTable('users', { id: Sequelize.INTEGER });
    */
      return queryInterface.createTable('measures', { 
          id:  {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        macAddress: Sequelize.STRING,
        rssi: Sequelize.FLOAT,
        location: {
                type: Sequelize.INTEGER,
                references: {
                    model: 'locations',
                    key: 'id'
                },
                onUpdate: 'cascade',
                onDelete: 'cascade'
            }
        })
  },

  down: function (queryInterface, Sequelize) {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.dropTable('users');
    */
    return queryInterface.dropTable('measures')
  }
};

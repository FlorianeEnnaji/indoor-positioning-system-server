'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.bulkInsert('Person', [{
        name: 'John Doe',
        isBetaMember: false
      }], {});
    */
    return queryInterface.bulkInsert('locations', [{
        id: 1,
        posX: 0,
        posY: 1
    },{
      id: 2,
      posX: 1,
      posY: 1
    },{
      id: 3,
      posX: 1,
      posY: 0
    }], {});
  },

  down: function (queryInterface, Sequelize) {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.bulkDelete('Person', null, {});
    */
    return queryInterface.bulkDelete('locations', null, {});
  }
};


/*
  Y
  ^   AP1
  |   *
  |       pos1    pos2
  |        ¤       ¤
  |     
  |
  |                ¤
  |               pos3
  |
  |   *                   *
  |   AP2                 AP3
  |
  ---------------------------> X
 */

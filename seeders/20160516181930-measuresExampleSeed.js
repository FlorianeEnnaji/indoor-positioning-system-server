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
   return queryInterface.bulkInsert('measures', [{
        macAddress: "1F-C8-F1-01-B0-AD", // Ap1
        rssi: -10.0,
        location: 1
      }, {
        macAddress: "A6-03-CB-06-A6-41", // Ap2
        rssi: -15.0,
        location: 1
      }, {
        macAddress: "A4-40-19-7E-B6-55", // Ap3
        rssi: -20.0,
        location: 1
      }, {
        macAddress: "1F-C8-F1-01-B0-AD",
        rssi: -15.0,
        location: 2
      }, {
        macAddress: "A6-03-CB-06-A6-41",
        rssi: -20.0,
        location: 2
      }, {
        macAddress: "A4-40-19-7E-B6-55",
        rssi: -15.0,
        location: 2
      }, {
        macAddress: "1F-C8-F1-01-B0-AD",
        rssi: -20.0,
        location: 3
      }, {
        macAddress: "A6-03-CB-06-A6-41",
        rssi: -15.0,
        location: 3
      }, {
        macAddress: "A4-40-19-7E-B6-55",
        rssi: -10.0,
        location: 3
      }], {});
  },

  down: function (queryInterface, Sequelize) {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.bulkDelete('Person', null, {});
    */
   return queryInterface.bulkDelete('measures', null, {});
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

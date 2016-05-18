'use strict';
module.exports = function(sequelize, DataTypes) {
  var measures = sequelize.define('measures', {
    macAddress: DataTypes.STRING,
    rssi: DataTypes.FLOAT,
    location: DataTypes.INTEGER
  }, {
    timestamps: false,
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return measures;
};
'use strict';
module.exports = function(sequelize, DataTypes) {
  var locations = sequelize.define('locations', {
    posX: DataTypes.FLOAT,
    posY: DataTypes.FLOAT
  }, {
    timestamps: false,
    instanceMethods: {
      getCoordinate: function() {
        return { x: this.posX, y: this.posY}
      }
    }
  });
  return locations;
};
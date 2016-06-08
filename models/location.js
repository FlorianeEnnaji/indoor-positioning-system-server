/**
 * @file location.js
 * @brief Model of a location with x and y parameters
 * @date May 18, 2016
 */

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

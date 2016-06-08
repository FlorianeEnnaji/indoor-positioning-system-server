/**
 * @file index.js
 * @brief Automatically generated file
 */
 'use strict';


var fs         = require('fs');
var path       = require('path');
var Sequelize  = require('sequelize');
var colors     = require('colors');
var basename   = path.basename(module.filename);
var env        = process.env.NODE_ENV || 'development';
var dbConfFile = __dirname + '\\..\\configurations\\databaseConf.json'
var db         = {};

try {
  fs.statSync(dbConfFile)
}
catch(err) {
  console.log('\nError:'.bold.red + ' The file who contain the ' + 'database configuration'.bold + ' is ' + 'missing'.bold)
  console.log('Please create one at: ' + 'configurations/datbaseConf.json'.yellow)
  console.log('You can use the example provide as model')
  process.exit(1);
}

var config    = require(dbConfFile)[env];

if (config.use_env_variable) {
  var sequelize = new Sequelize(process.env[config.use_env_variable]);
} else {
  var sequelize = new Sequelize(config.database, config.username, config.password, config);
}

fs
  .readdirSync(__dirname)
  .filter(function(file) {
    return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
  })
  .forEach(function(file) {
    var model = sequelize['import'](path.join(__dirname, file));
    db[model.name] = model;
  });

Object.keys(db).forEach(function(modelName) {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;

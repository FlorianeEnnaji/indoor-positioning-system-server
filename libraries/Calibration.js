
var db  = require("../models");

// The callibration object insert all the calibration data inside the database
// <!> Not finish yet <!>
var Calibration = {}


Calibration.saveLocation = function(reqBody){
	db.locations.findOrCreate({
		posX:0.1,
		posY:0.2
	}).then(function(data){
			console.log(data.dataValues)
	})
}


Calibration.saveMeasures = function(reqBody){
	db.measure.create({
	    macAddress: "A4-40-19-7E-B6-55",
	    rssi: -10,
	    location: 1
	}).then(function(data){
			console.log(data.dataValues)
	})
}

module.exports = Calibration
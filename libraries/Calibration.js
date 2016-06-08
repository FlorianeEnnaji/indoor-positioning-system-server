/**
 * @file Calibration.js
 * @brief Manages calibration data
 * @date May 18, 2016
 *
 * The calibration object insert all the calibration data inside the database
 * Calibration can be done by multiple devices at the same time
 */

const colors = require('colors');
const db 	 = require("../models");
const logger = require('./Logger');

var Calibration = {}

var locationPostData = ["PosX", "PosY"]

var currentLocations = []

/**
 * @brief function that save position we received from a request and measures we received from our APs
 * @param reqBody the body of the request we received
 * @param receivedMeasures all measures received
 */
Calibration.saveProbe = function(reqBody, recievedMeasures){

	if(!this._parseReqBody(locationPostData, reqBody)) // check that the packet is correct
		return

	logger.Calibration('Saving the probe (X=' + reqBody.PosX + ' Y=' + reqBody.PosY + ')')

	db.locations.findOrCreate({ where:{ // first insert the location inside the DB
		posX: reqBody.PosX,
		posY: reqBody.PosY
	}}).then(function(data){
		var formatedMeasures = []
		recievedMeasures.forEach(elem => {
			formatedMeasures.push({rssi: elem.RSSI, macAddress: elem.APid, location: data[0].dataValues.id})
		})
		//console.log(recievedMeasures)
		db.measures.bulkCreate(formatedMeasures).then(function(data){}) // Then insert all the measures for this location
	})

}

/**
 * @brief function that checks if we can parse the request body
 * @param neededValues the number of value we want to get from the parse
 * @param reqBody the body of the request we received
 * @return a boolean to check if the parse can be made successfully
 */
Calibration._parseReqBody = function(neededValues, reqBody){
	var noError = neededValues.every(opt => { // check that all properties are correctly formated
		if(reqBody[opt] == undefined){ // display a warning message otherwise
		//	logger.Calibration('Warning '.blue + 'The post parameter: ' + colors.bold(opt) + ' is missing !')
			return false;
		}
		return true;
	})
	if(!noError){
		logger.Calibration('Warning '.blue + 'Packet ignored'.bold)
		return false;
	}
	return true;

}

module.exports = Calibration

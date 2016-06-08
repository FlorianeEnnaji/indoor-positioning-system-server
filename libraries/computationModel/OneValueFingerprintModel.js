/**
 * @file OneValueFingerprintModel.js
 * @brief Computes location of the device using a simple one value fingerprinting model
 * @date May 20, 2016
 *
 * It's a model based on a single measurement we saw in LO53 lessons.
 */
const dbCache  = require("../DbCache");

var  OneValueFingerprintModel = {}

/**
 * @brief function that gets location from receivedMeasures using Fingerprint method
 * @param receivedMeasures all received measures
 * @return the most accurate position
 */
OneValueFingerprintModel.getLocation = function(receivedMeasures){
	receivedMeasures = this._formatReceivedMeasures(receivedMeasures)
	//console.log(receivedMeasures)

	var bestDistance = Infinity
	var bestPositionId = null;
	dbCache.SingleValue.getData().forEach((elem, posId) => {

		var dist = this._RSSIDistance(receivedMeasures, elem)
		//console.log('Distance: ' + dist)
		if(dist < bestDistance){
			bestDistance = dist
			bestPositionId = posId
		}

	})
	if(bestPositionId == null)
		return null
	return dbCache.getLocation(bestPositionId)
}

/**
 * @brief function that changes the format of received measures
 * @param receivedMeasures all received measures
 * @return formatedMeasures the same measures formated
 */
OneValueFingerprintModel._formatReceivedMeasures = function(receivedMeasures){
	var formatedMeasures = []
	receivedMeasures.forEach(elem => {
		formatedMeasures[elem.APid] = {value: elem.RSSI, nbVal: 1}
	})
	return formatedMeasures
}

/**
 * @brief function that computes the RSSI distance between two measurements
 * @param measures1 the first set of measures
 * @param measures2 the second set of measures
 * @return dist the distance between the 2 sets
 */
OneValueFingerprintModel._RSSIDistance = function(measures1, measures2){
	var dist = 0
	for (ApId in measures1){
		if(measures2[ApId] != undefined)
			dist += Math.pow(measures1[ApId].value - measures2[ApId].value,2)
		else{
			dist = Math.pow(measures1[ApId].value - 95,2)
		}
	}
	for (ApId in measures2){
		if(measures1[ApId] == undefined){
			dist = Math.pow(measures1[ApId].value - 95,2)
		}
	}
	return Math.sqrt(dist)
}




module.exports = OneValueFingerprintModel

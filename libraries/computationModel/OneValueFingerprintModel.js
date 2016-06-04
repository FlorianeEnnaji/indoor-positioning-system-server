
const dbCache  = require("../DbCache");

// Computation model based on a single measurement
var  OneValueFingerprintModel = {}

OneValueFingerprintModel.getLocation = function(recievedMeasures){
	recievedMeasures = this._formatReceivedMeasures(recievedMeasures)
	//console.log(recievedMeasures)

	var bestDistance = Infinity
	var bestPositionId = null;
	dbCache.SingleValue.getData().forEach((elem, posId) => {

		var dist = this._RSSIDistance(recievedMeasures, elem)
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

OneValueFingerprintModel._formatReceivedMeasures = function(recievedMeasures){
	var formatedMeasures = []
	recievedMeasures.forEach(elem => {
		formatedMeasures[elem.APid] = {value: elem.RSSI, nbVal: 1}
	})
	return formatedMeasures
}


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
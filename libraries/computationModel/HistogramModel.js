
const dbCache  = require("../DbCache");

// Computation model based on a multiple measurements
var  HistogramModel = {}

HistogramModel.getLocation = function(recievedMeasures){
	recievedMeasures = this._formatReceivedMeasures(recievedMeasures)
	//console.log(recievedMeasures)

	var bestProba = 0
	var bestPositionId = null;
	dbCache.SingleValue.getData().forEach((elem, posId) => {

		var dist = this._measureDistance(recievedMeasures, elem)
		//console.log('Distance: ' + dist)
		if(dist < bestProba){
			bestProba = dist
			bestPositionId = posId
		}

	})
	if(bestPositionId == null)
		return null
	return dbCache.getLocation(bestPositionId)
}


HistogramModel._formatReceivedMeasures = function(recievedMeasures){
	var formatedMeasures = []
	recievedMeasures.forEach(elem => {
		if (formatedMeasures[elem.APid] == undefined)
			formatedMeasures[elem.APid] = []
		if (formatedMeasures[elem.APid][elem.RSSI] == undefined)
			formatedMeasures[elem.APid][elem.RSSI] = 1
		else
			formatedMeasures[elem.APid][elem.RSSI]++
	})
	return formatedMeasures
}



HistogramModel._measureDistance = function(measures1, measures2){
	var proba = 1
	for (ApId in measures1){
		if(measures2[ApId] != undefined)
			proba *= this._historgramOverlapProba(measures1[ApId], measures2[ApId])
		else{
			return 0
		}
	}
	return proba
}

HistogramModel._historgramOverlapProba = function(histo1, histo2){
	var overlapProba = 0
	for (RSSI in histo1){
		if(histo2[RSSI] != undefined)
			overlapProba += Math.min(histo1[RSSI]/histo1['totalValue'], histo2[RSSI]/histo2['totalValue'])
	}
	return overlapProba
}



module.exports = HistogramModel
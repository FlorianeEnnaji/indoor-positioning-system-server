/**
 * @file HistogramModel.js
 * @brief Computes location of the device using the Histogram Model
 * @date June 3, 2016
 *
 * It's a model based on several measurements we saw in LO53 lessons.
 */

const dbCache  = require("../DbCache");

var  HistogramModel = {}

/**
 * function that gets location from receivedMeasures using Histogram method
 * @param receivedMeasures all received measures
 * @return the most accurate position
 */
HistogramModel.getLocation = function(receivedMeasures){
	receivedMeasures = this._formatReceivedMeasures(receivedMeasures)
	//console.log(receivedMeasures)

	var bestProba = 0
	var bestPositionId = null;
	dbCache.SingleValue.getData().forEach((elem, posId) => {

		var dist = this._measureDistance(receivedMeasures, elem)
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

/**
 * function that changes the format of received measures
 * @param receivedMeasures all received measures
 * @return formatedMeasures the same measures formated
 */
HistogramModel._formatReceivedMeasures = function(receivedMeasures){
	var formatedMeasures = []
	receivedMeasures.forEach(elem => {
		if (formatedMeasures[elem.APid] == undefined)
			formatedMeasures[elem.APid] = []
		if (formatedMeasures[elem.APid][elem.RSSI] == undefined)
			formatedMeasures[elem.APid][elem.RSSI] = 1
		else
			formatedMeasures[elem.APid][elem.RSSI]++
	})
	return formatedMeasures
}

/**
 * function that computes the difference (0 totally different, 1 totally the same)
 * between two measurements
 * @param measures1 the first set of measures
 * @param measures2 the second set of measures
 * @return proba the difference between the 2 sets
 */
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

/**
 * function that computes the similarity (0 totally different, 1 totally the same)
 * between two histograms
 * @param histo1 the first histogram
 * @param histo2 the second histogram
 * @return overlapProba the similarity between the 2 histograms
 */
HistogramModel._historgramOverlapProba = function(histo1, histo2){
	var overlapProba = 0
	for (RSSI in histo1){
		if(histo2[RSSI] != undefined)
			overlapProba += Math.min(histo1[RSSI]/histo1['totalValue'], histo2[RSSI]/histo2['totalValue'])
	}
	return overlapProba
}



module.exports = HistogramModel

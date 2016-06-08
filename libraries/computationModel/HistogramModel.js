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
 * @brief function that gets location from receivedMeasures using Histogram method
 * @param receivedMeasures all received measures
 * @return the most accurate position
 */
HistogramModel.getLocation = function(receivedMeasures){
	parsedMeasures = this._formatReceivedMeasures(receivedMeasures)
	//console.log(recievedMeasures)
	//console.log(parsedMeasures)

	var bestProba = 0
	var bestPositionId = null;
	dbCache.Histogram.getData().forEach((elem, posId) => {

		var proba = this._measureDistance2(parsedMeasures, elem)
		//console.log('Distance: ' + proba, 'point : ' + posId)
		if(proba < bestProba){
			bestProba = proba
			bestPositionId = posId
		}

	})
	//console.log('best pos: ' + bestPositionId)
	if(bestPositionId == null)
		return null
	return dbCache.getLocation(bestPositionId)
}

/**
 * @brief function that changes the format of received measures
 * @param receivedMeasures all received measures
 * @return formatedMeasures the same measures formated
 */
HistogramModel._formatReceivedMeasures = function(receivedMeasures){
	var formatedMeasures = []
	receivedMeasures.forEach(elem => {
		if (formatedMeasures[elem.APid] == undefined)
			formatedMeasures[elem.APid] = []
			formatedMeasures[elem.APid]['totalValue'] = 0
		}

		var RSSI = parseInt(elem.RSSI)
		formatedMeasures[elem.APid]['totalValue']++
		if (formatedMeasures[elem.APid][RSSI] == undefined)
			formatedMeasures[elem.APid][RSSI] = 1
		else
			formatedMeasures[elem.APid][RSSI]++
	})
	return formatedMeasures
}

/**
 * @brief function that computes the difference between two measurements
 * (0 totally different, 1 totally the same)
 * @param measures1 the first set of measures
 * @param measures2 the second set of measures
 * @return proba the difference between the 2 sets
 */
HistogramModel._measureDistance2 = function(measures1, measures2){
	var proba = 1
	for (ApId in measures1){
		if(measures2[ApId] != undefined){
			var myProb = this._historgramOverlapProba(measures1[ApId], measures2[ApId])
			proba *= myProb;
		}
		else
			return 0
	}
	return proba
}

/**
 * @brief function that computes the difference between two measurements
 * (0 totally different, 1 totally the same)
 * @param measures1 the first set of measures
 * @param measures2 the second set of measures
 * @return proba the difference between the 2 sets
 */
HistogramModel._measureDistance = function(measures1, measures2){
	var proba = 0
	var nbHisto = 0
	for (ApId in measures1){
		if(measures2[ApId] != undefined){
			nbHisto++
			proba += this._historgramOverlapProba(measures1[ApId], measures2[ApId])*100
		}else
			return 0
	}
	return proba/nbHisto
}

/**
 * @brief function that computes the similarity between two histograms
 * (0 totally different, 1 totally the same)
 * @param histo1 the first histogram
 * @param histo2 the second histogram
 * @return overlapProba the similarity between the 2 histograms
 */
HistogramModel._historgramOverlapProba = function(histo1, histo2){
	var overlapProba = 0
	for (RSSI in histo1){
		if(histo2[RSSI] != undefined && RSSI != 'totalValue'){
			overlapProba += Math.min(histo1[RSSI]/histo1['totalValue'], histo2[RSSI]/histo2['totalValue'])
			// console.log("h1 " + histo1[RSSI] + " " + histo1['totalValue'])
			// console.log("h2 " + histo2[RSSI] + " " + histo2['totalValue'])
			// console.log("proba " + overlapProba)
		}
	}
	//console.log(overlapProba, histo1['totalValue'], histo2['totalValue'],  histo1[RSSI], histo2[RSSI], histo1[RSSI]/histo1['totalValue'], histo2[RSSI]/histo2['totalValue'])
	console.log( overlapProba)
	return overlapProba
}



module.exports = HistogramModel

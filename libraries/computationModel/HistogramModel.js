
const dbCache  = require("../DbCache");	

// Computation model based on a multiple measurements
var  HistogramModel = {}

HistogramModel.getLocation = function(recievedMeasures){
	parsedMeasures = this._formatReceivedMeasures(recievedMeasures)
	//console.log(recievedMeasures)
	//console.log(parsedMeasures)

	var bestProba = 0
	var bestPositionId = null;
	dbCache.Histogram.getData().forEach((elem, posId) => {
		//console.log('Distance: ' + elem, 'point : ' + posId)

		var proba = this._measureDistance(parsedMeasures, elem)
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


HistogramModel._formatReceivedMeasures = function(recievedMeasures){
	var formatedMeasures = []
	recievedMeasures.forEach(elem => {
		if (formatedMeasures[elem.APid] == undefined){
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
	//console.log( overlapProba)
	return overlapProba
}



module.exports = HistogramModel
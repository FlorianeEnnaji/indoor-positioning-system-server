const db = require('../models');

// This object will load all data from the database, and arrage it for the computation model selected*
// All parsing operation need to be done before retriving the data
var dbCache = {}

// cache locations
dbCache._locations = []
dbCache.parseLocations = function(){
	return db.locations.findAll().then((data) => {
	data.forEach( elem => {
		this._locations[elem.dataValues.id] = elem.getCoordinate()
	})
})
}
dbCache.getLocation = function(locationId){
	if(this._locations.length == 0)
		this.parseLocations()
	return this._locations[locationId]
}

// cache system for a sigle value model
dbCache.SingleValue = {}
dbCache.SingleValue._singleValueMeasures = []
dbCache.SingleValue.getDataForSingleValueModel = function(){
	if(this._singleValueMeasures.length == 0)
		this.parseDataForSingleValueModel()
	return this._singleValueMeasures
}
dbCache.SingleValue.parseDataForSingleValueModel = function(){ // parse all measures inside an array 
	return db.measures.findAll().then((data) => { 
		data.forEach( elem => {
			if(this._singleValueMeasures[elem.dataValues.location]  == undefined) // if its a new location we and an entry
				this._singleValueMeasures[elem.dataValues.location] = []

			if(this._singleValueMeasures[elem.dataValues.location][elem.dataValues.macAddress]  == undefined){ // if it's a new Apid we add an entry
				this._singleValueMeasures[elem.dataValues.location][elem.dataValues.macAddress] = { value: elem.dataValues.rssi, nbVal: 1}
			}else{
				var val = this._singleValueMeasures[elem.dataValues.location][elem.dataValues.macAddress]// do the average for all the rssi with the same location and ApId
				this._singleValueMeasures[elem.dataValues.location][elem.dataValues.macAddress] = { value: (elem.dataValues.rssi + val.value*val.nbVal)/val.nbVal+1, nbVal: val.nbVal+1}
			}
		})
	})
}


module.exports = dbCache
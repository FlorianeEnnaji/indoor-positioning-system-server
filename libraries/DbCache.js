var colors = require('colors');

const db   = require('../models');
var logger = require('./Logger');

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
	return this._locations[locationId]
}

// cache system for a sigle value model
dbCache.SingleValue = {}
dbCache.SingleValue._data = []
dbCache.SingleValue.getData = function(){
	return this._data
}
dbCache.SingleValue.parseData = function(){ // parse all measures inside an array 
	return db.measures.findAll().then(data => { 
		data.forEach( elem => {
			if(this._data[elem.dataValues.location]  == undefined) // if its a new location we and an entry
				this._data[elem.dataValues.location] = []

			if(this._data[elem.dataValues.location][elem.dataValues.macAddress]  == undefined){ // if it's a new Apid we add an entry
				this._data[elem.dataValues.location][elem.dataValues.macAddress] = { value: elem.dataValues.rssi, nbVal: 1}
			}else{
				var val = this._data[elem.dataValues.location][elem.dataValues.macAddress]// do the average for all the rssi with the same location and ApId
				this._data[elem.dataValues.location][elem.dataValues.macAddress] = { value: (elem.dataValues.rssi + val.value*val.nbVal)/(val.nbVal+1), nbVal: val.nbVal+1}
			}
		})
	})
}

// cache system for a sigle value model
dbCache.Histogram = {}
dbCache.Histogram._data = []
dbCache.Histogram.getData = function(){
	return this._data
}
dbCache.Histogram.parseData = function(){ // parse all measures inside an array 
	return db.measures.findAll().then(data => { 
		data.forEach( elem => {
			if( this._data[elem.dataValues.location]  == undefined) // if its a new location we and an entry
				this._data[elem.dataValues.location] = []

			if( this._data[elem.dataValues.location][elem.dataValues.macAddress]  == undefined){ // if it's a new Apid we add an entry
				this._data[elem.dataValues.location][elem.dataValues.macAddress] = []
				this._data[elem.dataValues.location][elem.dataValues.macAddress]['totalValue'] = 0
			}
			this._data[elem.dataValues.location][elem.dataValues.macAddress]['totalValue']++
			if( this._data[elem.dataValues.location][elem.dataValues.macAddress][elem.dataValues.rssi]  == undefined){ // if it's a new Apid we add an entry
				this._data[elem.dataValues.location][elem.dataValues.macAddress][elem.dataValues.rssi] = 1
			}else{
				this._data[elem.dataValues.location][elem.dataValues.macAddress][elem.dataValues.rssi]++
			}
		})
	})
}

dbCache.cacheAll = function(model){
	var locationCachePromise = dbCache.parseLocations().then(function(){
		logger.DBCache(colors.bold(Object.keys(dbCache._locations).length) + ' ' + 'locations'.bold + ' cached.');
	})
	var modelDataCachePromise = dbCache[model].parseData().then(function(){

		logger.DBCache('Data for '+ colors.bold(model) +' model cached. ' + Object.keys(dbCache[model]._data).length + ' entities');
		//logger.DBCache(dbCache[model]._data);
	})
	return Promise.all([locationCachePromise, modelDataCachePromise])
}



module.exports = dbCache
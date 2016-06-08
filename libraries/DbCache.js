/**
 * @file dbCache.js
 * @brief loads data from the database and prepare them for the computation
 * @date June 3, 2016
 *
 * This object will load all data from the database, and prepare it for the computation model selected
 * All parsing operation need to be done before retrieving the data
 */

var colors = require('colors');

const db   = require('../models');
var logger = require('./Logger');

var dbCache = {}

/* cache locations */
dbCache._locations = []
/**
 * @brief function that parses location array
 * @return a promise
 */
dbCache.parseLocations = function(){
	return db.locations.findAll().then((data) => {
	data.forEach( elem => {
		this._locations[elem.dataValues.id] = elem.getCoordinate()
	})
})
}
/**
 * @brief function that get a location from the location array
 * @param locationId the index of the location we want in the array
 * @return the location from the location array
 */
dbCache.getLocation = function(locationId){
	return this._locations[locationId]
}

// cache system for a single value model
dbCache.SingleValue = {}
dbCache.SingleValue._data = []

/**
 * @brief function that gets the data from a single value model
 * @return the data from the single value model
 */
dbCache.SingleValue.getData = function(){
	return this._data
}

/**
 * @brief function that gets the data from the db and parse the data from a single value model
 * @return the data from the single value model in the right format
 */
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

// cache system for a histogram model
dbCache.Histogram = {}
dbCache.Histogram._data = []

/**
 * @brief function that gets the data from a histogram model
 * @return the data from the histogram model
 */
dbCache.Histogram.getData = function(){
	return this._data
}

/**
 * @brief function that gets the data from the db and parse the data from a histogram model
 * @return the data from the histogram model in the right format
 */
dbCache.Histogram.parseData = function(){ // parse all measures inside an array
	return db.measures.findAll().then(data => {
		data.forEach( elem => {
			if( this._data[elem.dataValues.location]  == undefined) // if its a new location we and an entry
				this._data[elem.dataValues.location] = []

			if( this._data[elem.dataValues.location][elem.dataValues.macAddress]  == undefined){ // if it's a new Apid we add an entry
				this._data[elem.dataValues.location][elem.dataValues.macAddress] = []
				this._data[elem.dataValues.location]['totalValue'] = 0
		}
			this._data[elem.dataValues.location]['totalValue']++
			if( this._data[elem.dataValues.location][elem.dataValues.macAddress][elem.dataValues.rssi]  == undefined){ // if it's a new Apid we add an entry
				this._data[elem.dataValues.location][elem.dataValues.macAddress][elem.dataValues.rssi] = 1
			}else{
				this._data[elem.dataValues.location][elem.dataValues.macAddress][elem.dataValues.rssi]++
			}
		})
	})
}

/**
 * @brief function that caches all data from a given model
 * @param the model we want to cache data from
 * @return a promise
 */
dbCache.cacheAll = function(model){
	var locationCachePromise = dbCache.parseLocations().then(function(){
		logger.DBCache(colors.bold(Object.keys(dbCache._locations).length) + ' ' + 'locations'.bold + ' cached.');
	})
	var modelDataCachePromise = dbCache[model].parseData().then(function(){

		logger.DBCache('Data for '+ colors.bold(model) +' model cached. ' + Object.keys(dbCache[model]._data).length + ' entities');
		logger.DBCache(dbCache[model]._data);
	})
	return Promise.all([locationCachePromise, modelDataCachePromise])
}



module.exports = dbCache

/**
 * @file Agregator.js
 * @brief Collect and parse all measures packets
 * @date May 18, 2016
 *
 * This object will collect and parse all measures packets send form APs
 * for a single location request (send by a device)
 */

const util         = require('util');
const EventEmitter = require('events');
const colors       = require('colors');
const logger	   = require('../libraries/Logger');

function Agregator (options) {
	var thisOptions = options || {}
    this.timeWindow = thisOptions.timeWindow || 300
    this.queueMaxLength = thisOptions.queueMaxLength || 50
    this.countingMeasureEnable = thisOptions.countingMeasureEnable != undefined ? thisOptions.countingMeasureEnable : true
    this.measuresPerRequest = thisOptions.measuresPerRequest || 4
    this.incomingMeasureRequests = []
    this.incomingLocationRequests = []
}

util.inherits(Agregator, EventEmitter);

/**
 * @brief function that collects measures packets
 * @param req the request we received
 * @return a boolean to check if the collection was made successfully
 */
Agregator.prototype.collect = function(req) {
	if (!req.body.APid || !req.body.DeviceIp || !req.body.RSSI){
		logger.Agregator('ERROR'.bold.red + 'measure packet body error')
		return false;
	}

	var rssi = req.body.RSSI.split(',')
	rssi.forEach(elem => {
		var data = {receivedTime: Date.now(), APid: req.body.APid, DeviceIp: req.body.DeviceIp, RSSI: elem}
	    this.incomingMeasureRequests.push(data)

	    if(this.incomingMeasureRequests > this.queueMaxLength)
	    	this.incomingLocationRequests.splice(0, 1)

	    if (this.countingMeasureEnable)
			this._proceedPacket(data)
	})
    return true;
}

/**
 * @brief function that waits and returns collected measures packets
 * @param deviceIp the IP address of the device we're tracking
 */
Agregator.prototype.getData = function(deviceIp){
	//console.log(deviceIp)
	var beginTime = Date.now();
	return new Promise((resolve, reject) => {
		if(this.incomingLocationRequests[deviceIp] != undefined){
			//reject('Warning'.blue + ': A location request has already been sent for ' + colors.bold(deviceIp))
			return;
		}

		var timeOut = setTimeout(() => { this._getDataPacket(deviceIp, resolve) }, this.timeWindow)
		this.incomingLocationRequests[deviceIp] = { packetReceived: 0, timeOut: timeOut, start: beginTime, resolver: resolve}

	})
}

/**
 * @brief function that checks if we have the same number of packets as AP number
 * @param packetDetail the details of the packet we received
 */
Agregator.prototype._proceedPacket = function(packetDetail){
	if(this.incomingLocationRequests[packetDetail.DeviceIp] != undefined){
		this.incomingLocationRequests[packetDetail.DeviceIp].packetReceived++
		var client = this.incomingLocationRequests[packetDetail.DeviceIp]
		clearTimeout(client.timeOut) // stop the old time out
		var remainingTime = this.timeWindow - (Date.now() - client.start)

		if (remainingTime > 20 && client.packetReceived <= this.measuresPerRequest )
			this.incomingLocationRequests[packetDetail.DeviceIp].timeOut =  setTimeout(() => {this._getDataPacket(packetDetail.DeviceIp, client.resolver) }, remainingTime)
		else{
			this._getDataPacket(packetDetail.DeviceIp, client.resolver);
		}
	}
}

/**
 * @brief function that finds measure packets in the list for a particular deviceIp
 * @param deviceIp the IP address of the device we're tracking
 * @param resolver the function to un-pause the system again
 */
Agregator.prototype._getDataPacket = function(deviceIp, resolver){
	logger.Agregator('Proceed request for ' + colors.bold(deviceIp))

//	console.log(this.incomingLocationRequests)
	this._cleanQueue()
	delete this.incomingLocationRequests[deviceIp]

	// extract correct request
	var measures = []
	this.incomingMeasureRequests.forEach(elem => {
		//console.log(elem.DeviceIp, deviceIp, elem.DeviceIp == deviceIp)
		if(elem.DeviceIp == deviceIp)
			measures.push(elem)
	})
	resolver(measures);
}



Agregator.prototype._cleanQueue = function(){
	while (this.incomingMeasureRequests.length > 0 && Date.now() - this.incomingMeasureRequests[0].receivedTime > this.timeWindow)
		this.incomingMeasureRequests.splice(0,1);
}

Agregator.prototype._autoCleanQueues = function(){
	if(this.incomingMeasureRequests.length > this.autoCleanMaxLength){
		logger.Agregator('Auto clean incomingMeasureRequests queue, length: ' + this.incomingMeasureRequests.length)
		this.incomingMeasureRequests.splice(0, this.incomingMeasureRequests.length - this.autoCleanMaxLength)
	}
	if (this.incomingLocationRequests.length > this.autoCleanMaxLength){
		logger.Agregator('Auto clean incomingLocationRequests queue, length: ' + this.incomingMeasureRequests.length)
		this.incomingLocationRequests.splice(0, this.incomingLocationRequests.length - this.autoCleanMaxLength)
	}
}


module.exports = function(options){
	return new Agregator(options);
}

const util         = require('util');
const EventEmitter = require('events');
const colors       = require('colors');
const logger	   = require('../libraries/Logger');

// This object will colect and parse all measures packets send form APs for a single location request (send by a device)
function Agregator (options) {
	var thisOptions = options || {}
    this.timeWindow = thisOptions.timeWindow || 300
    this.queueMaxLength = thisOptions.queueMaxLength || 50
    this.countingMeasureEnable = thisOptions.countingMeasureEnable != undefined ? thisOptions.countingMeasureEnable : true
    this.measuresPerRequest = thisOptions.measuresPerRequest || 4
    this.measuresUnit = thisOptions.measuresUnit || "dBm"
    this.incomingMeasureRequests = []
    this.incomingLocationRequests = []
}

util.inherits(Agregator, EventEmitter);

// Collect measure packets
Agregator.prototype.collect = function(req, res) {
	if (!req.body.APid || !req.body.DeviceIp || (!req.body.RSSI_dBm && this.measuresUnit == "dBm") || (!req.body.RSSI_pW  && this.measuresUnit == "pW")){
		logger.Agregator('ERROR'.bold.red + ' measure packet body error')
		return false;
	}

	var rssi = []
	if(this.measuresUnit == "dBm")
		rssi = req.body.RSSI_dBm.split(',')
	if(this.measuresUnit == "pW")
		rssi = req.body.RSSI_pW.split(',')
	rssi.forEach((elem, index) => {
		var data = {receivedTime: Date.now(), APid: req.body.APid + "#" + index, DeviceIp: req.body.DeviceIp, RSSI: elem }
	    this.incomingMeasureRequests.push(data)

	    if(this.incomingMeasureRequests > this.queueMaxLength)
	    	this.incomingLocationRequests.splice(0, 1) 

	    if (this.countingMeasureEnable)
			this._proceedPacket(data)
	})
    return true;
}

// wait and return collected measure packets
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

// retrive measure packets in the list for a particular deviceIp
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
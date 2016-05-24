const util         = require('util');
const EventEmitter = require('events');
const colors       = require('colors');
const logger	   = require('../libraries/Logger');

// This object will colect and parse all measures packets send form APs for a single location request (send by a device)
function Agregator (options) {
	var thisOptions = options || {}
    this.timeWindow = thisOptions.timeWindow || 300
    this.countingMeasureEnable = thisOptions.countingMeasureEnable != undefined ? thisOptions.countingMeasureEnable : true
    this.measuresPerRequest = thisOptions.measuresPerRequest || 4
    this.incomingMeasureRequests = []
    this.incomingLocationRequests = []
}

util.inherits(Agregator, EventEmitter);

// Collect measure packets
Agregator.prototype.collect = function(req, res) {
	if (!req.body.APid || !req.body.DeviceIp || !req.body.RSSI) 
		return false;
	var data = {receivedTime: Date.now(), APid: req.body.APid, DeviceIp: req.body.DeviceIp, RSSI: req.body.RSSI}
    this.incomingMeasureRequests.push(data)

    if (this.countingMeasureEnable)
		this.emit('newDataPacket', data)
    return true;
}

// wait and return collected measure packets
Agregator.prototype.getData = function(deviceIp){
	var beginTime = Date.now();
	return new Promise((resolve, reject) => {
		if(this.incomingLocationRequests[deviceIp] != undefined){
			reject('Warning'.blue + ': A location request has already been sent for ' + colors.bold(deviceIp))
			return;
		}


		this.incomingLocationRequests[deviceIp] = true
		var timeOut = setTimeout(() => { this._getDataPacket(deviceIp, resolve) }, this.timeWindow)
		var currentReceivePacket = 0;
		var resolved = false;

		this.on('newDataPacket', packetDetail => {
			console.log( this.countingMeasureEnable)
			if(packetDetail.DeviceIp == deviceIp && !resolved){
				currentReceivePacket++;
				clearTimeout(timeOut) // stop the old time out
				var remainingTime = this.timeWindow - (Date.now() - beginTime)

				if (remainingTime > 20 && currentReceivePacket != this.measuresPerRequest ) 
					timeOut =  setTimeout(() => { this._getDataPacket(deviceIp, resolve) }, remainingTime)
				else{
					resolved = true;
					this._getDataPacket(deviceIp, resolve);
				}
			}
		})

	}) 
}

// retrive measure packets in the list for a particular deviceIp
Agregator.prototype._getDataPacket = function(deviceIp, resolver){
	logger.Agregator('Proceed request for ' + colors.bold(deviceIp))

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


module.exports = function(options){
	return new Agregator(options);
}
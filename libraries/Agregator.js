const util = require('util');
const EventEmitter = require('events');

// This object will colect and parse all measures packets send form APs for a single location request (send by a device)
function Agregator (options) {
	var thisOptions = options || {}
    this.timeWindow = thisOptions.timeWindow || 300
    this.numberOfAp = thisOptions.numberOfAp || 4
    this.incomingRequests = []
}

util.inherits(Agregator, EventEmitter);

// Collect measure packets
Agregator.prototype.collect = function(req, res) {
	if (!req.body.APid || !req.body.DeviceIp || !req.body.RSSI) 
		return false;
	var data = {receivedTime: Date.now(), APid: req.body.APid, DeviceIp: req.body.DeviceIp, RSSI: req.body.RSSI}

    this.incomingRequests.push(data)
	this.emit('newDataPacket', data)
    return true;
}

// wait and return collected measure packets
Agregator.prototype.getData = function(deviceIp){
	var beginTime = Date.now();
	return new Promise((resolve, reject) => {

		var timeOut = setTimeout(() => { this._getDataPacket(deviceIp, resolve) }, this.timeWindow)
		var currentReceivePacket = 0;
		var resolved = false;

		this.on('newDataPacket', packetDetail => {
			if(packetDetail.DeviceIp == deviceIp && !resolved){
				currentReceivePacket++;
				clearTimeout(timeOut) // stop the old time out
				var remainingTime = this.timeWindow - (Date.now() - beginTime)

				if (remainingTime > 20 && currentReceivePacket != this.numberOfAp ) 
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
	console.log('proceed request')

	this._cleanQueue()

	// extract correct request
	var measures = []
	this.incomingRequests.forEach(elem => {
		//console.log(elem.DeviceIp, deviceIp, elem.DeviceIp == deviceIp)
		if(elem.DeviceIp == deviceIp)
			measures.push(elem)
	})
	resolver(measures);
}



Agregator.prototype._cleanQueue = function(){
	while (this.incomingRequests.length > 0 && Date.now() - this.incomingRequests[0].receivedTime > this.timeWindow)
		this.incomingRequests.splice(0,1)
}


module.exports = function(options){
	return new Agregator(options);
}
/**
 * @file globalConf.js
 * @brief stores global configurations for the server
 * @date April 27, 2016
 */
module.exports = {
	ServerPort            :   process.env.PORT || 8090,
	ServerHostName        :   '192.168.1.200',
    AuthorizeAPid         :   [],     // not yet implemented
    NumberOfAp      	  :   12,      // number of total AP in your location system 
    DataPacketTimeWindow  :   600,    // delay after when can consider a packet is not count in the location measure (in ms)
    CalibrationTimeWindow :   1000,   // delay to get all measures for one location in caliibration mode (in ms)
    ComputationModel 	  :   "SingleValue", // can be ["SingleValue", "Histogram"]
    measuresUnit          :   "pW",   // unit of the RSSI, can be ["pW", "dBm"]
	Debugging			  :   true,
	LogLevel			  :   ["Network", "DBCache", "Location", "Agregator", "Calibration"]
}


// global configurations of the server
module.exports = {
	ServerPort            :   process.env.PORT || 8090, 
	ServerHostName        :   '192.168.1.43', 
    AuthorizeAPid         :   ['192.168.1.107'],     // not yet implemented
    NumberOfAp      	  :   3,      // number of total AP in your location system 
    DataPacketTimeWindow  :   600,    // delay after when can consider a packet is not count in the location measure (in ms)
    CalibrationTimeWindow :   1000,   // delay to get all measures for one location in caliibration mode (in ms)
    ComputationModel 	  :   "SingleValue", // can be ["SingleValue", "Histogram", "Gauss"]
	Debugging			  :   true,
	LogLevel			  :   ["Network", "DBCache", "Location", "Agregator", "Calibration"]
}
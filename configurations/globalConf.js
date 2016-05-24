
// global configurations of the server
module.exports = {
	ServerPort            :   process.env.PORT || 8080, 
	ServerHostName        :   '127.0.0.1', 
    AuthorizeAPid         :   [],     // not yet implemented
    NumberOfAp      	  :   3,      // number of total AP in your location system 
    DataPacketTimeWindow  :   600,    // delay after when can consider a packet is not count in the location measure (in ms)
    CalibrationTimeWindow :   2000,   // delay to get all measures for one location in caliibration mode (in ms)
    ComputationModel 	  :   "SingleValue", // can be ["SingleValue", "Histogram", "Gauss"]
    CalibrationMode       :   true,   // true if we wan to enable the callibration mode
	Debugging			  :   true,
	LogLevel			  :   ["Network", "DBCache", "Location", "Agregator", "Calibration"]
}
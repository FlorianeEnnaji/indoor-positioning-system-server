// server.js

// REQUIRE SETUP
// ==============================================

var express   		= require('express');
var bodyParser 		= require('body-parser');
var colors     		= require('colors');

var globalConf		 = require('./configurations/globalConf');
var Agregator 		 = require('./libraries/Agregator');
var dbCache   		 = require("./libraries/DbCache");
var logger	  		 = require('./libraries/Logger');
var Calibration	     = require('./libraries/Calibration');
var computationModel = require("./libraries/ComputationModel")[globalConf.ComputationModel];

// ENV VAR
// ==============================================

var app        = express();
var router     = express.Router();
var agregator  = Agregator({timeWindow: globalConf.DataPacketTimeWindow, countingMeasureEnable: true, measuresPerRequest : globalConf.NumberOfAp}) // Agregator parameters must be set in function of the chosen model 

// CONF
// ==============================================

// to support URL-encoded bodies
app.use(bodyParser.urlencoded({    
  extended: true
})); 

// API request logger
router.use(function(req, res, next) {
  logger.Network(colors.bold(req.method + ' ' + req.url));
  next();
});

// ROUTES
// ==============================================

app.get('/', function(req, res) {
	logger.Network(colors.bold(req.method + ' ' + req.url));
    res.send('Home page');  
});

// /api/locate-me
router.get('/locate-me', function(req, res) {
	//var deviceIp = req.connection.remoteAddress
	var deviceIp = '192.168.1.53' // for debugging
	
    agregator.getData(deviceIp).then(ApData => {
    	pos = computationModel.getLocation(ApData)
    	//console.log(ApData)
    	logger.Location(pos)

    	res.send(pos)
    }).catch(error=> {
    	res.send(JSON.stringify({error: "A error Append"}))
    	logger.Agregator(error)
    })
});

// POST parameters:
// 		APid     : Id of the AP
// 		DeviceIp : Ip of the device
// 		RSSI     : Signal strength of the recieved packet
// /api/AP-measure
router.post('/AP-measure', function(req, res){
	if(agregator.collect(req, res))
		res.send('Ok');
	else
		res.send('Error');

});


if (globalConf.CalibrationMode){
	logger.log('Calibration mode is ' + 'Enable'.green)

	var calibrationAgregator  = Agregator({timeWindow: globalConf.CalibrationTimeWindow, countingMeasureEnable: false})

	// api/calibration/send-probe
	router.post('/calibration/send-probe', function(req, res) {
		var deviceIp = req.body.DeviceIp // for debugging
		calibrationAgregator.getData(deviceIp).then(ApData => {
			Calibration.saveProbe(req.body, ApData)
		}).catch(error=> {
			logger.Agregator(error)
		})
	    res.send('Ok Thanks :)');  
	});

	// api/calibration/AP-measure
	router.post('/calibration/AP-measure', function(req, res) {
		calibrationAgregator.collect(req, res)
		res.send('Ok');
	});

}else{
// 	logger.log('Calibration mode is ' + 'Disable'.red)
}

// apply theses routes to our application
app.use('/api', router);


// START THE SERVER
// ==============================================

app.listen(globalConf.ServerPort, globalConf.ServerHostName);
logger.Network('Server started: listen on ' + colors.bold(globalConf.ServerHostName + ':' + globalConf.ServerPort));


var locationCachePromise = dbCache.parseLocations().then(function(){
	logger.DBCache('Locations cached');
})
var modelDataCachePromise = dbCache[globalConf.ComputationModel].parseDataForSingleValueModel().then(function(){
	logger.DBCache('Data for '+ colors.bold(globalConf.ComputationModel) +' model cached');
})



Promise.all([locationCachePromise, modelDataCachePromise]).then(() => {
	logger.log('\nServer Ready ♥\n'.rainbow);
})
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
var agregator  = Agregator({timeWindow: globalConf.DataPacketTimeWindow, countingMeasureEnable: false, measuresPerRequest : globalConf.NumberOfAp}) // Agregator parameters must be set in function of the chosen model (histogram)

var agregator  = Agregator({timeWindow: globalConf.DataPacketTimeWindow, countingMeasureEnable: true, measuresPerRequest : globalConf.NumberOfAp}) // Agregator parameters must be set in function of the chosen model (single value)

// CONF
// ==============================================

// to support URL-encoded bodies
app.use(bodyParser.urlencoded({    
  extended: true
})); 

// API request logger
router.use(function(req, res, next) {
 // logger.Network(req.connection.remoteAddress + ' ' + colors.bold(req.method + ' ' + req.url) + ' ' + JSON.stringify(req.body));
  next();
});

// ROUTES
// ==============================================

var calibrationMode = false
if (process.argv.indexOf("calibration") != -1)
	calibrationMode = true

app.get('/', function(req, res) {
	logger.Network(colors.bold(req.method + ' ' + req.url));
    res.send('Home page');  
});

router.get('/', function(req, res) {
	res.send({
		isInCalibrationMode : calibrationMode,
		computationModel    : globalConf.ComputationModel
		})	
})

router.get('/ping', function(req, res) {
	res.send("pong")	
})

if (!calibrationMode){
	// 	logger.log('Calibration mode is ' + 'Disable'.red)

	// /api/locate-me
	router.get('/locate-me', function(req, res) {
		var deviceIp = req.connection.remoteAddress
		//var deviceIp = '192.168.1.53' // for debugging

	    agregator.getData(deviceIp).then(ApData => {
		    //console.log(ApData)		
	    	pos = computationModel.getLocation(ApData)
	    	if (pos != null) {
		    	logger.Location(pos)
		    	res.send(pos) 		
	    	}else{
		    	logger.Location('ERROR'.red + ' No location found')
		    	res.send({x: -100, y: -100})		
	    	}

	    },error => {
	    	res.send({error: "A error Append"})
	    	logger.Agregator(error)
	    })
	});

	// POST parameters:
	// 		APid     : Id of the AP
	// 		DeviceIp : Ip of the device
	// 		RSSI     : Signal strength of the recieved packet
	// /api/AP-measure
	router.post('/AP-measure', function(req, res){
		req.body.APid = req.connection.remoteAddress
		//console.log(req.connection.remoteAddress)
		if(agregator.collect(req, res))
			res.send('Ok');
		else
			res.send('Error');
	});


}else{
	logger.log('Calibration mode is ' + 'Enable'.green)

	var calibrationAgregator  = Agregator({timeWindow: globalConf.CalibrationTimeWindow, countingMeasureEnable: false})

	// /api/calibration/send-probe
	router.post('/send-probe', function(req, res) {
		var deviceIp = req.connection.remoteAddress
		calibrationAgregator.getData(deviceIp).then(ApData => {
			Calibration.saveProbe(req.body, ApData)
		}).catch(error=> {
			logger.Agregator(error)
		})
	    res.send('Ok Thanks :)');  
	});

	// /api/AP-measure
	router.post('/AP-measure', function(req, res) {
		req.body.APid = req.connection.remoteAddress
		calibrationAgregator.collect(req, res)
		res.send('Ok');
	});

}

// apply theses routes to our application
app.use('/api', router);


// START THE SERVER
// ==============================================

app.listen(globalConf.ServerPort, globalConf.ServerHostName);
logger.log('ComputationModel: ' + colors.bold(globalConf.ComputationModel));
logger.Network('Server started: listen on ' + colors.bold(globalConf.ServerHostName + ':' + globalConf.ServerPort));

if(!calibrationMode){
	dbCache.cacheAll(globalConf.ComputationModel).then(() => {
		logger.log('\nServer Ready ♥\n'.rainbow);
	})
}else
	logger.log('\nServer Ready ♥\n'.rainbow);
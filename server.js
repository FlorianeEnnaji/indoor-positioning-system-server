/**
 * @file server.js
 * @brief Contains all necessary methods to config the server
 * @date April 15, 2016
 *
 * Creates routes for all get and post requests
 * for Calibration and positioning modes.
 *
 */

/** required variables for setup */
var express   		= require('express');
var bodyParser 		= require('body-parser');
var colors     		= require('colors');

var globalConf		 = require('./configurations/globalConf');
var Agregator 		 = require('./libraries/Agregator');
var dbCache   		 = require("./libraries/DbCache");
var logger	  		 = require('./libraries/Logger');
var Calibration	     = require('./libraries/Calibration');
var computationModel = require("./libraries/ComputationModel")[globalConf.ComputationModel];


/** variables used for the environment */
var app        = express();
var router     = express.Router();

//var agregator  = Agregator({timeWindow: globalConf.DataPacketTimeWindow, countingMeasureEnable: false, measuresPerRequest : globalConf.NumberOfAp, measuresUnit: globalConf.measuresUnit}) // Agregator parameters must be set in function of the chosen model (histogram)

var agregator  = Agregator({timeWindow: globalConf.DataPacketTimeWindow, countingMeasureEnable: true, measuresPerRequest : globalConf.NumberOfAp, measuresUnit: globalConf.measuresUnit}) // Agregator parameters must be set in function of the chosen model (single value)


/** Configurations */

/** to support URL-encoded bodies */
app.use(bodyParser.urlencoded({
  extended: true
}));

/** API request logger */
router.use(function(req, res, next) {
  /* Following line is commented because it slows down communication when we receive a lot of requests, uncomment if you want to see request logs */
 // logger.Network(req.connection.remoteAddress + ' ' + colors.bold(req.method + ' ' + req.url) + ' ' + JSON.stringify(req.body));
  next();
});

/**Routes*/

/**Calibration*/
var calibrationMode = false
if (process.argv.indexOf("calibration") != -1)
	calibrationMode = true

/**Simple get, testing purpose*/
app.get('/', function(req, res) {
	logger.Network(colors.bold(req.method + ' ' + req.url));
    res.send('Home page');
});

/**get from the mobile application, so it knows if it's in calibration or positioning*/
router.get('/', function(req, res) {
	res.send({
		isInCalibrationMode : calibrationMode,
		computationModel    : globalConf.ComputationModel
		})
})

/**Ping*/
router.get('/ping', function(req, res) {
	res.send("pong")
})

/**Positioning mode case*/
if (!calibrationMode){
	// 	logger.log('Calibration mode is ' + 'Disable'.red)

	/** Address : /api/locate-me */
	router.get('/locate-me', function(req, res) {
		var deviceIp = req.connection.remoteAddress
    /* Uncomment following for debuging */
		//var deviceIp = '192.168.1.53'

	    agregator.getData(deviceIp).then(ApData => {
		    //console.log(ApData)
	    	pos = computationModel.getLocation(ApData)
	    	if (pos != null) {
		    	logger.Location(pos)
		    	pos.Error = false;
		    	res.send(pos) 		
	    	}else{
		    	logger.Location('ERROR'.red + ' No location found')
		    	res.send({Error: true})		
	    	}

	    },error => {
	    	res.send({error: "A error Append"})
	    	logger.Agregator(error)
	    })
	});

	/** POST parameters:
	 * 		APid     : Id of the AP
	 * 		DeviceIp : Ip of the device
	 * 		RSSI     : Signal strength of the recieved packet
	 * /api/AP-measure */
	router.post('/AP-measure', function(req, res){
		req.body.APid = req.connection.remoteAddress
		//console.log(req.connection.remoteAddress)
		if(agregator.collect(req))
			res.send('Ok');
		else
			res.send('Error');
	});


}else{
  /** Calibration mode case*/
	logger.log('Calibration mode is ' + 'Enable'.green)

	var calibrationAgregator  = Agregator({timeWindow: globalConf.CalibrationTimeWindow, countingMeasureEnable: false,  measuresUnit: globalConf.measuresUnit})

	/**Address : /api/calibration/send-probe*/
	router.post('/send-probe', function(req, res) {
		var deviceIp = req.connection.remoteAddress
		calibrationAgregator.getData(deviceIp).then(ApData => {
			Calibration.saveProbe(req.body, ApData)
		}).catch(error=> {
			logger.Agregator(error)
		})
	    res.send('Ok Thanks :)');
	});

	/** Address : /api/AP-measure*/
	router.post('/AP-measure', function(req, res) {
		req.body.APid = req.connection.remoteAddress
		calibrationAgregator.collect(req, res)
		res.send('Ok');
	});

}

/** Add all theses routes to our application */
app.use('/api', router);


/**Starts the server*/

app.listen(globalConf.ServerPort, globalConf.ServerHostName);
logger.log('ComputationModel: ' + colors.bold(globalConf.ComputationModel));
logger.Network('Server started: listen on ' + colors.bold(globalConf.ServerHostName + ':' + globalConf.ServerPort));

if(!calibrationMode){
	dbCache.cacheAll(globalConf.ComputationModel).then(() => {
		logger.log('\nServer Ready\n'.rainbow);
	})
}else
	logger.log('\nServer Ready\n'.rainbow);

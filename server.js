// server.js

// REQUIRE SETUP
// ==============================================

var express    = require('express');
var bodyParser = require('body-parser')

var globalConf = require('./configurations/globalConf');
var Agregator  = require('./libraries/Agregator');
var dbCache    = require("./libraries/DbCache");
var computationModel  = require("./libraries/ComputationModel")[globalConf.ComputationModel];

// ENV VAR
// ==============================================

var app        = express();
var router     = express.Router();
var agregator  = Agregator({timeWindow: globalConf.DataPacketTimeWindow, numberOfAp : globalConf.NumberOfAp})

// CONF
// ==============================================

 // to support URL-encoded bodies
app.use(bodyParser.urlencoded({    
  extended: true
})); 

// API request logger
router.use(function(req, res, next) {
  console.log('%s %s %s', req.method, req.url, req.path);
  next();
});

// ROUTES
// ==============================================

app.get('/', function(req, res) {
	console.log('%s %s %s', req.method, req.url, req.path);
    res.send('Home page');  
});


router.get('/locate-me', function(req, res) {
	//var deviceIp = req.connection.remoteAddress
	var deviceIp = '192.168.1.53' // for debugging
	
    agregator.getData(deviceIp).then(ApData => {
    	pos = computationModel.getLocation(ApData)
    	//console.log(ApData)
    	console.log(pos)

    	res.send(pos)
    })
});

// POST parameters:
// 		APid     : Id of the AP
// 		DeviceIp : Ip of the device
// 		RSSI     : Signal strength of the recieved packet
router.post('/AP-measure', function(req, res){
	if(agregator.collect(req, res))
		res.send('Ok');
	else
		res.send('Error');

});

if (globalConf.CallibrationMode){
	router.get('/callibration/send-probe', function(req, res) {
		// not yet implemented
	    res.send('Save the fingerprint for the probe ');  
	});

	router.post('/callibration/AP-measure', function(req, res) {
		// not yet implemented
	    res.send('Collecting callibration measure from AP'); 
	});
}

// apply theses routes to our application
app.use('/api', router);


// START THE SERVER
// ==============================================

app.listen(globalConf.ServerPort);
console.log('[Network] Server started: listen on port ' + globalConf.ServerPort);


var locationCachePromise = dbCache.parseLocations().then(function(){
	console.log('[DBCache] Locations cached');
})
var modelDataCachePromise = dbCache[globalConf.ComputationModel].parseDataForSingleValueModel().then(function(){
	console.log('[DBCache] Data for '+ globalConf.ComputationModel +' model cached');
})



Promise.all([locationCachePromise, modelDataCachePromise]).then(() => {
	console.log('');
	console.log('--------------');
	console.log(' Server Ready');
	console.log('--------------');
})
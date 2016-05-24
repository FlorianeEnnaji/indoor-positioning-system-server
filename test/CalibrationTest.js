
var http = require('http');
var querystring = require('querystring');

var serverIp   = "127.0.0.1"
var serverPort = "8080"

var deviceId1 = "192.168.1.53" 
var deviceId2 = "192.168.1.54" 

// In this we simulate 2 device sending 2 probe each to do the calibration 
console.log('Running calibration test:')


calibrationSequence1 = [{APid : '1F-C8-F1-01-B0-AD',
						 DeviceIp : deviceId1,
						 RSSI : '-20.0'
					    },{APid : 'A6-03-CB-06-A6-41',
						 DeviceIp : deviceId1,
						 RSSI : '-10.0'
						},{APid : 'A4-40-19-7E-B6-55',
						 DeviceIp : deviceId1,
						 RSSI : '-6.0'
						},{APid : '1F-C8-F1-01-B0-AD',
						 DeviceIp : deviceId1,
						 RSSI : '-20.5'
						},{APid : 'A6-03-CB-06-A6-41',
						 DeviceIp : deviceId1,
						 RSSI : '-10.1'
						},{APid : 'A4-40-19-7E-B6-55',
						 DeviceIp : deviceId1,
						 RSSI : '-6.2'
						}]

calibrationSequence2 = [{APid : '1F-C8-F1-01-B0-AD',
						 DeviceIp : deviceId2,
						 RSSI : '-4'
					    },{APid : 'A6-03-CB-06-A6-41',
						 DeviceIp : deviceId2,
						 RSSI : '-6.4'
						},{APid : 'A4-40-19-7E-B6-55',
						 DeviceIp : deviceId2,
						 RSSI : '-9.5'
						},{APid : '1F-C8-F1-01-B0-AD',
						 DeviceIp : deviceId2,
						 RSSI : '-4'
						},{APid : 'A6-03-CB-06-A6-41',
						 DeviceIp : deviceId2,
						 RSSI : '-6.5'
						},{APid : 'A4-40-19-7E-B6-55',
						 DeviceIp : deviceId2,
						 RSSI : '-9.0'
						}]

var beginTime = Date.now()

console.log(' POST: Send the 2 probes from device1: /api/calibration/send-probe')
sendPost('/api/calibration/send-probe', {PosX:1, PosY:2, DeviceIp: deviceId1}).then(data => {})
sendPost('/api/calibration/send-probe', {PosX:1, PosY:2, DeviceIp: deviceId1}).then(data => {})
calibrationSequence1.forEach( elem => {
	delay(random(100, 400)).then(() => {
		console.log('[device1] - Send post: /api/calibration/AP-measure after ', Date.now() - beginTime, 'ms')
		sendPost('/api/calibration/AP-measure', elem).then(data => {})
	})
})

console.log(' POST: Send the 2 probes from device2: /api/calibration/send-probe')
sendPost('/api/calibration/send-probe', {PosX:0, PosY:0, DeviceIp: deviceId2}).then(data => {})
sendPost('/api/calibration/send-probe', {PosX:0, PosY:0, DeviceIp: deviceId2}).then(data => {})
calibrationSequence2.forEach( elem => {
	delay(random(100, 400)).then(() => {
		console.log('[device2] - Send post : /api/calibration/AP-measure after ', Date.now() - beginTime, 'ms')
		sendPost('/api/calibration/AP-measure', elem).then(data => {})
	})
})







function sendGet(uri){
	return new Promise((resolve, reject) => {
		http.get('http://' + serverIp + ':' + serverPort + uri, (res) => {
			var body = '';
			res.on('data', function(chunk) {
				body += chunk;
			});
			res.on('end', function() {
				resolve(body, res);
			});
			res.resume();
		}).on('error', (e) => {

		    console.log(`problem with request: ${e.message}`);
			reject(e)
		});
	})
}


function sendPost(uri, data){
	return new Promise((resolve, reject) => {

		var postData = querystring.stringify(data);

		var incomingData = ""

		var options = {
		  hostname: serverIp,
		  port: serverPort,
		  path: uri,
		  method: 'POST',
		  headers: {
		    'Content-Type': 'application/x-www-form-urlencoded',
		    'Content-Length': postData.length
		  }
		};

		var req = http.request(options, (res) => {
		  res.setEncoding('utf8');
		  res.on('data', (chunk) => {
		    incomingData += chunk;
		  });

		  res.on('end', () => {
		    resolve(incomingData)
		  })

		});

		req.on('error', (e) => {
		    console.log(`problem with request: ${e.message}`);
			reject(e)
		});

		// write data to request body
		req.write(postData);
		req.end();
		
	})

}



function delay(millis) {
	return new Promise( (resolve, reject) => {
	    setTimeout(function() {
	        resolve();
	    }, millis);
	})
}

function random(min, max){
	return Math.floor(Math.random() * (max -min) + min)
}
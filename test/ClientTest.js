
var http = require('http');
var querystring = require('querystring');

var serverIp   = "127.0.0.1"
var serverPort = "8090"


console.log('Running test:')

console.log(' - Send get: /api/locate-me')
sendGet('/api/locate-me').then(data => {
	console.log(' GET - response: ' + data)
})


dataMesure = [{APid : '1F-C8-F1-01-B0-AD',
			   DeviceIp : '192.168.1.53',
			   RSSI : '-21.0'
			},{APid : 'A6-03-CB-06-A6-41',
			   DeviceIp : '192.168.1.53',
			   RSSI : '-15.0'
			},{APid : 'A4-40-19-7E-B6-55',
			   DeviceIp : '192.168.1.53',
			   RSSI : '-9.0'
			}]
			/*{APid : '192.168.1.5',
			   DeviceIp : '192.168.1.53',
			   RSSI : '-9'
			},{APid : '192.168.1.6',
			   DeviceIp : '192.168.1.53',
			   RSSI : '-5.8'
			}*/

dataMesure.forEach( elem => {
	var beginTime = Date.now()
	delay(random(0, 300)).then(() => {
		console.log(' - Send post: /api/AP-measure after ', Date.now() - beginTime, 'ms')
		sendPost('/api/AP-measure', elem).then(data => {})
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
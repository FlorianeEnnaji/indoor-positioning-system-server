/**
 * @file Logger.js
 * @brief helper to log datas in the console
 * @date June 3, 2016
 *
 */

var globalConf = require('../configurations/globalConf');
var colors     = require('colors');

var log = {
	log: function(){ // create the basic logging function
		console.log.apply(console, arguments)
	}
}

globalConf.LogLevel.forEach(elem => {
	log[elem] = function(){ // create a log function for each log level
			var args = Array.prototype.slice.call(arguments);
			if(globalConf.Debugging){ // log only if debugging is enable
					args.unshift('[' + elem + ']')
					args[0] = colors.yellow(args[0])
					console.log.apply(console, args)
			}
	}
})

module.exports = log

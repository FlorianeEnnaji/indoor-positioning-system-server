// var db  = require("./models");
 
// db.locations.findAll().then(function(data){
// 	data.forEach( elem => {
// 		console.log(elem.dataValues)
// 	})
// })

var dbCache  = require("./libraries/DbCache");

dbCache.SingleValue.parseDataForSingleValueModel().then(function(){
	console.log(dbCache.SingleValue.getDataForSingleValueModel())
	return;
})

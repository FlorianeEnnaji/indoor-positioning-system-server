var db  = require("../models");
 
// db.locations.findAll().then(function(data){
// 	data.forEach( elem => {
// 		console.log(elem.dataValues)
// 	})
// })

db.locations.create({
	posX:0.1,
	posY:0.2
}).then(function(data){
		console.log(data.dataValues)

})


// var dbCache  = require("./libraries/DbCache");

// dbCache.SingleValue.parseDataForSingleValueModel().then(function(){
// 	console.log(dbCache.SingleValue.getDataForSingleValueModel())
// 	return;
// })



const OneValueFingerprintModel  = require("./computationModel/OneValueFingerprintModel");


// router to select different model of computation
module.exports = {
	"SingleValue": OneValueFingerprintModel,
	"Histogram": null,
	"Gauss": null
}
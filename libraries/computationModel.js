

const OneValueFingerprintModel  = require("./computationModel/OneValueFingerprintModel");
const HistogramModel  = require("./computationModel/HistogramModel");


// router to select different model of computation
module.exports = {
	"SingleValue": OneValueFingerprintModel,
	"Histogram": HistogramModel
}
/**
 * @file computationModel.js
 * @brief stores all possible computation models
 * @date June 3, 2016
 */

const OneValueFingerprintModel  = require("./computationModel/OneValueFingerprintModel");
const HistogramModel  = require("./computationModel/HistogramModel");


// router to select different model of computation
module.exports = {
	"SingleValue": OneValueFingerprintModel,
	"Histogram": HistogramModel
}

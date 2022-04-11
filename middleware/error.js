const logger = require("../helpers/logger");
const sendErr = require("../helpers/sendError");

module.exports = function (err, req, res, next) {
	logger.error(err.message, err);

	sendErr(res, 500, "Something failed.");
};

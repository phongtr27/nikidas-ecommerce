module.exports = function (res, statusCode, message) {
	return res.status(statusCode).send({
		statusCode,
		message,
	});
};

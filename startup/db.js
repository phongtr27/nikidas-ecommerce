const mongoose = require("mongoose");
const logger = require("../helpers/logger");

module.exports = function () {
	mongoose.connect(
		process.env.DB,
		{
			useNewUrlParser: true,
			useUnifiedTopology: true,
		},
		() => logger.info("Connected to MongoDB")
	);
};

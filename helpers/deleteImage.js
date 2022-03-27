const fs = require("fs");
const logger = require("./logger");

const deleteImage = (path) => {
	fs.unlink(path, (err) => {
		if (err) {
			logger.error(err);
		}
	});
};

module.exports = deleteImage;

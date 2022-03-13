const multer = require("multer");

module.exports = function (folder) {
	const storage = multer.diskStorage({
		destination: function (req, file, cb) {
			cb(null, `./public/images/${folder}`);
		},
		filename: function (req, file, cb) {
			cb(null, file.fieldname + "-" + Date.now() + file.originalname);
		},
	});

	const fileFilter = (req, file, cb) => {
		if (
			file.mimetype == "image/png" ||
			file.mimetype == "image/jpg" ||
			file.mimetype == "image/jpeg"
		) {
			cb(null, true);
		} else {
			return cb(null, false);
		}
	};

	return multer({ storage, fileFilter });
};

// const storage = multer.diskStorage({
// 	destination: function (req, file, cb) {
// 		cb(null, "./public/images/categories");
// 	},
// 	filename: function (req, file, cb) {
// 		cb(null, file.fieldname + "-" + Date.now() + file.originalname);
// 	},
// });

// const fileFilter = (req, file, cb) => {
// 	if (
// 		file.mimetype == "image/png" ||
// 		file.mimetype == "image/jpg" ||
// 		file.mimetype == "image/jpeg"
// 	) {
// 		cb(null, true);
// 	} else {
// 		return cb(null, false);
// 	}
// };

// const upload = multer({ storage, fileFilter });

// module.exports = upload;

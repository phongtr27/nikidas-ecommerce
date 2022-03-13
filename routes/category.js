const fs = require("fs");
const express = require("express");
const logger = require("../helpers/logger");
const { Category, validate } = require("../models/category");
const upload = require("../middleware/uploadImage");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");

const router = express.Router();

router.get("/", [auth, admin], async (req, res, err) => {
	const categories = await Category.find();
	res.send(categories);
});

router.get("/:id", [auth, admin], async (req, res, err) => {
	const category = await Category.findById(req.params.id);

	if (!category)
		return res.status(404).send("Category with given ID not found.");

	res.send(category);
});

router.post(
	"/",
	[auth, admin, upload.single("category")],
	async (req, res, err) => {
		const { error } = validate(req.body);
		if (error) {
			if (req.file) {
				fs.unlink(req.file.path, (err) => {
					if (err) {
						logger.error(err);
					}
				});
			}

			return res.status(400).send(error.details[0].message);
		}

		if (!req.file)
			return res.status(400).send("Please choose an image to upload.");

		const category = new Category({
			name: req.body.name,
			img: req.file.path.slice(6),
		});
		await category.save();

		res.send("Successfully Added.");
	}
);

router.delete("/:id", [auth, admin], async (req, res, err) => {
	const category = await Category.findByIdAndDelete(req.params.id);

	if (!category)
		return res.status(404).send("Category with given ID not found.");

	res.send("Successfully Deleted.");
});

router.put(
	"/:id",
	[auth, admin, upload.single("category")],
	async (req, res, err) => {
		let category = await Category.findById(req.params.id);
		if (!category) {
			if (req.file) {
				fs.unlink(req.file.path, (err) => {
					if (err) {
						logger.error(err);
					}
				});
			}

			return res.status(404).send("Category with given ID not found.");
		}

		const oldImagePath = `public${category.img}`;

		const { error } = validate(req.body);
		if (error) {
			if (req.file) {
				fs.unlink(req.file.path, (err) => {
					if (err) {
						logger.error(err);
					}
				});
			}

			return res.status(400).send(error.details[0].message);
		}

		if (!req.file)
			return res.status(400).send("Please choose an image to upload.");

		await Category.updateOne({
			name: req.body.name,
			img: req.file.path.slice(6),
		});

		fs.unlink(oldImagePath, (err) => {
			if (err) {
				logger.error(err);
			}
		});

		res.send("Successfully Updated.");
	}
);

module.exports = router;

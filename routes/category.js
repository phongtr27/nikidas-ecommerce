const express = require("express");
const { Category, validate } = require("../models/category");
const upload = require("../middleware/uploadImage");
const deleteImage = require("../helpers/deleteImage");
const sendErr = require("../helpers/sendError");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");

const router = express.Router();

router.get("/", async (req, res, err) => {
	const categories = await Category.find();
	res.send(categories);
});

router.get("/:id", async (req, res, err) => {
	const category = await Category.findById(req.params.id);

	if (!category)
		return sendErr(res, 404, "Category with given ID not found.");

	res.send(category);
});

router.post(
	"/",
	[auth, admin, upload("categories").single("category")],
	async (req, res, err) => {
		const { error } = validate(req.body);
		if (error) {
			if (req.file) {
				deleteImage(req.file.path);
			}

			return sendErr(res, 400, error.details[0].message);
		}

		if (!req.file)
			return sendErr(res, 400, "Please choose an image to upload.");

		const category = new Category({
			name: req.body.name,
			img: req.file.path.slice(6),
		});
		await category.save();

		res.send({ message: "Successfully Added." });
	}
);

router.delete("/:id", [auth, admin], async (req, res, err) => {
	const category = await Category.findByIdAndDelete(req.params.id);

	if (!category)
		return sendErr(res, 404, "Category with given ID not found.");

	deleteImage(`public${category.img}`);

	res.send({ message: "Successfully Deleted." });
});

router.put(
	"/:id",
	[auth, admin, upload("categories").single("category")],
	async (req, res, err) => {
		let category = await Category.findById(req.params.id);
		if (!category) {
			if (req.file) {
				deleteImage(req.file.path);
			}

			return sendErr(res, 404, "Category with given ID not found.");
		}

		const oldImagePath = `public${category.img}`;

		const { error } = validate(req.body);
		if (error) {
			if (req.file) {
				deleteImage(req.file.path);
			}

			return sendErr(res, 400, error.details[0].message);
		}

		if (!req.file) {
			await Category.updateOne(
				{ _id: req.params.id },
				{ name: req.body.name }
			);
		} else {
			await Category.updateOne(
				{ _id: req.params.id },
				{
					name: req.body.name,
					img: req.file.path.slice(6),
				}
			);

			deleteImage(oldImagePath);
		}

		res.send({ message: "Successfully Updated." });
	}
);

module.exports = router;

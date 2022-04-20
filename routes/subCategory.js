const express = require("express");
const { SubCategory, validate } = require("../models/subCategory");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const sendErr = require("../helpers/sendError");

const router = express.Router();

router.get("/", async (req, res, err) => {
	const subCategories = await SubCategory.find();
	res.send(subCategories);
});

router.get("/:id", async (req, res, err) => {
	const subCategory = await SubCategory.findById(req.params.id);

	if (!subCategory)
		return sendErr(res, 404, "Sub-category with given ID not found.");

	res.send(subCategory);
});

router.post("/", [auth, admin], async (req, res, err) => {
	const { error } = validate(req.body);
	if (error) return sendErr(res, 400, error.details[0].message);

	const subCategory = new SubCategory({
		name: req.body.name,
		category: req.body.category,
	});
	await subCategory.save();

	res.send({ message: "Successfully Added." });
});

router.put("/:id", [auth, admin], async (req, res, err) => {
	const { error } = validate(req.body);
	if (error) return sendErr(res, 400, error.details[0].message);

	const subCategory = await SubCategory.findByIdAndUpdate(
		req.params.id,
		{
			name: req.body.name,
			category: req.body.category,
		},
		{ new: true }
	);

	if (!subCategory)
		return sendErr(res, 404, "Sub-category with given ID not found.");

	res.send({ message: "Successfully Updated." });
});

router.delete("/:id", [auth, admin], async (req, res, err) => {
	const subCategory = await SubCategory.findByIdAndDelete(req.params.id);

	if (!subCategory)
		return sendErr(res, 404, "Sub-category with given ID not found.");

	res.send({ message: "Successfully Deleted." });
});

module.exports = router;

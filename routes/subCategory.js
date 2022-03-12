const express = require("express");
const logger = require("../helpers/logger");
const { SubCategory, validate } = require("../models/subCategory");

const router = express.Router();

router.get("/", async (req, res, err) => {
	const subCategories = await SubCategory.find();
	res.send(subCategories);
});

router.get("/:id", async (req, res, err) => {
	const subCategory = await SubCategory.findById(req.params.id);

	if (!subCategory)
		return res.status(404).send("Sub-category with given ID not found.");

	res.send(subCategory);
});

router.post("/", async (req, res, err) => {
	const { error } = validate(req.body);
	if (error) return res.status(400).send(error.details[0].message);

	const subCategory = new SubCategory({
		name: req.body.name,
		parentId: req.body.parentId,
	});
	await subCategory.save();

	res.send("Successfully Added.");
});

router.put("/:id", async (req, res, err) => {
	const { error } = validate(req.body);
	if (error) return res.status(400).send(error.details[0].message);

	const subCategory = await SubCategory.findByIdAndUpdate(
		req.params.id,
		{
			name: req.body.name,
			parentId: req.body.parentId,
		},
		{ new: true }
	);

	if (!subCategory)
		return res.status(404).send("Sub-category with given ID not found.");

	res.send("Successfully Updated.");
});

router.delete("/:id", async (req, res, err) => {
	const subCategory = await SubCategory.findByIdAndDelete(req.params.id);

	if (!subCategory)
		return res.status(404).send("Sub-category with given ID not found.");

	res.send("Successfully Deleted.");
});

module.exports = router;

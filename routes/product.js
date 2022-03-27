const express = require("express");
const { Product, validate } = require("../models/product");
const upload = require("../middleware/uploadImage");
const deleteImage = require("../helpers/deleteImage");

const router = express.Router();

router.get("/", async (req, res, err) => {
	const products = await Product.find();
	res.send(products);
});

router.get("/:id", async (req, res, err) => {
	const product = await Product.findById(req.params.id);

	if (!product)
		return res.status(404).send("Product with given ID not found.");

	res.send(product);
});

router.post("/", upload("products").any(), async (req, res, err) => {
	req.body.details = JSON.parse(req.body.details);

	const { error } = validate(req.body);
	if (error) {
		if (req.files.length > 0) {
			req.files.forEach((file) => {
				deleteImage(file.path);
			});
		}

		return res.status(400).send(error.details[0].message);
	}

	if (req.files.length == 0)
		return res.status(400).send("Please choose images to upload.");

	const product = new Product({
		name: req.body.name,
		category: req.body.category,
		subCategory: req.body.subCategory,
		description: req.body.description,
		basePrice: req.body.basePrice,
		discount: req.body.discount,
		details: req.body.details,
	});

	product.details.forEach((item, index) => {
		req.files.forEach((file) => {
			if (file.fieldname == index) item.img.push(file.path.slice(6));
		});
	});

	await product.save();

	res.send("Successfully Added.");
});

router.delete("/:id", async (req, res, err) => {
	const product = await Product.findByIdAndDelete(req.params.id);

	if (!product)
		return res.status(404).send("Product with given ID not found.");

	res.send("Successfully Deleted.");
});

router.put("/:id", upload("products").any(), async (req, res, err) => {
	const product = await Product.findById(req.params.id);
	if (!product) {
		if (req.files.length > 0) {
			req.files.forEach((file) => {
				deleteImage(file.path);
			});
		}

		return res.status(404).send("Product with given ID not found.");
	}

	req.body.details = JSON.parse(req.body.details);

	const { error } = validate(req.body);
	if (error) {
		if (req.files.length > 0) {
			req.files.forEach((file) => {
				deleteImage(file.path);
			});
		}

		return res.status(400).send(error.details[0].message);
	}

	if (req.files.length > 0) {
		req.body.details.forEach((item, index) => {
			item.img = [];
			req.files.forEach((file) => {
				if (file.fieldname == index) {
					item.img.push(file.path.slice(6));
				}
			});
		});
	} else {
		req.body.details.forEach((item, index) => {
			item.img = [];
		});
	}

	req.body.details.forEach((item, index) => {
		if (item.img.length == 0) {
			item.img = product.details[index].img;
		} else {
			if (product.details[index]) {
				product.details[index].img.forEach((image) =>
					deleteImage(`public${image}`)
				);
			}
		}
	});

	await Product.updateOne(
		{ _id: req.params.id },
		{
			name: req.body.name,
			category: req.body.category,
			subCategory: req.body.subCategory,
			description: req.body.description,
			basePrice: req.body.basePrice,
			discount: req.body.discount,
			details: req.body.details,
		}
	);

	res.send("Successfully Updated.");
});

module.exports = router;

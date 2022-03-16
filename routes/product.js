const express = require("express");
const fs = require("fs");
const { Product, validate } = require("../models/product");
const upload = require("../middleware/uploadImage");

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
	const { error } = validate(req.body);
	if (error) {
		if (req.files[0]) {
			req.files.map((file) => {
				fs.unlink(file.path, (err) => {
					if (err) {
						logger.error(err);
					}
				});
			});
		}

		return res.status(400).send(error.details[0].message);
	}

	if (!req.files[0])
		return res.status(400).send("Please choose images to upload.");

	const product = new Product({
		name: req.body.name,
		category: req.body.category,
		subCategory: req.body.subCategory,
		description: req.body.description,
		basePrice: req.body.basePrice,
		discount: req.body.discount,
		details: [],
	});

	req.body.colors.map((color) =>
		product.details.push({ color: color, img: [], quantityPerSize })
	);

	product.details.map((item, index) => {
		req.files.map((file) => {
			if (file.fieldname == index) item.img.push(file.path.slice(6));
		});

		//quanityPerSize
	});
});

module.exports = router;
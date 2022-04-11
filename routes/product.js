const express = require("express");
const { Product, validate } = require("../models/product");
const upload = require("../middleware/uploadImage");
const deleteImage = require("../helpers/deleteImage");
const sendErr = require("../helpers/sendError");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");

const router = express.Router();

router.get("/", async (req, res, err) => {
	const products = await Product.find();
	res.send(products);
});

router.get("/:id", async (req, res, err) => {
	const product = await Product.findById(req.params.id);

	if (!product) return sendErr(res, 404, "Product with given ID not found.");

	res.send(product);
});

router.post(
	"/",
	[auth, admin, upload("products").any()],
	async (req, res, err) => {
		req.body.options = JSON.parse(req.body.options);

		const { error } = validate(req.body);
		if (error) {
			if (req.files.length > 0) {
				req.files.forEach((file) => {
					deleteImage(file.path);
				});
			}

			return sendErr(res, 400, error.details[0].message);
		}

		if (req.files.length == 0)
			return sendErr(res, 400, "Please choose images to upload.");

		const product = new Product({
			name: req.body.name,
			category: req.body.category,
			subCategory: req.body.subCategory,
			description: req.body.description,
			basePrice: req.body.basePrice,
			discount: req.body.discount,
			options: req.body.options,
		});

		product.options.forEach((option, index) => {
			req.files.forEach((file) => {
				if (file.fieldname == index)
					option.img.push(file.path.slice(6));
			});
		});

		await product.save();

		res.send({ message: "Successfully Added." });
	}
);

router.delete("/:id", [auth, admin], async (req, res, err) => {
	const product = await Product.findByIdAndDelete(req.params.id);

	if (!product) return sendErr(res, 404, "Product with given ID not found.");

	res.send({ message: "Successfully Deleted." });
});

router.put(
	"/:id",
	[auth, admin, upload("products").any()],
	async (req, res, err) => {
		const product = await Product.findById(req.params.id);
		if (!product) {
			if (req.files.length > 0) {
				req.files.forEach((file) => {
					deleteImage(file.path);
				});
			}

			return sendErr(res, 404, "Product with given ID not found.");
		}

		req.body.options = JSON.parse(req.body.options);

		const { error } = validate(req.body);
		if (error) {
			if (req.files.length > 0) {
				req.files.forEach((file) => {
					deleteImage(file.path);
				});
			}

			return sendErr(res, 400, error.details[0].message);
		}

		if (req.files.length > 0) {
			req.body.options.forEach((option, index) => {
				option.img = [];
				req.files.forEach((file) => {
					if (file.fieldname == index) {
						option.img.push(file.path.slice(6));
					}
				});
			});
		} else {
			req.body.options.forEach((option, index) => {
				option.img = [];
			});
		}

		req.body.options.forEach((option, index) => {
			if (option.img.length == 0) {
				option.img = product.options[index].img;
			} else {
				if (product.options[index]) {
					product.options[index].img.forEach((image) =>
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
				options: req.body.options,
			}
		);

		res.send({ message: "Successfully Updated." });
	}
);

module.exports = router;

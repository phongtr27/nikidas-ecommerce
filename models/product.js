const mongoose = require("mongoose");
const Joi = require("joi");

const quantityPerSizeSchema = new mongoose.Schema({
	size: {
		type: String,
		minlength: 1,
		maxlength: 5,
		uppercase: true,
		required: true,
	},
	quantity: {
		type: Number,
		min: 0,
		required: true,
	},
});

const productDetailSchema = new mongoose.Schema({
	color: {
		type: String,
		lowercase: true,
		required: true,
	},
	img: {
		type: [String],
		required: true,
	},
	quantityPerSize: {
		type: [quantityPerSizeSchema],
		required: true,
	},
});

const productSchema = new mongoose.Schema({
	name: {
		type: String,
		minlength: 3,
		maxlength: 255,
		required: true,
	},
	category: {
		type: String,
		minlength: 3,
		maxlength: 100,
		lowercase: true,
		required: true,
	},
	subCategory: {
		type: String,
		minlength: 3,
		maxlength: 100,
		lowercase: true,
		required: true,
	},
	description: {
		type: String,
		minlength: 3,
		maxlength: 1000,
		required: true,
	},
	basePrice: {
		type: Number,
		min: 0.01,
		required: true,
		get: (v) => (v / 100).toFixed(2),
		set: (v) => v * 100,
	},
	discount: {
		type: Number,
		default: 0,
		min: 0,
		max: 90,
		get: (v) => v * 100,
		set: (v) => v / 100,
	},
	details: {
		type: [productDetailSchema],
		required: true,
	},
	sold: {
		type: Number,
		default: 0,
	},
});

const Product = mongoose.model("Product", productSchema);

const validateProduct = (obj) => {
	const schema = Joi.object({
		name: Joi.string().min(3).max(255).required(),
		category: Joi.string().min(3).max(100).required(),
		subCategory: Joi.string().min(3).max(100).required(),
		description: Joi.string().min(3).max(1000).required(),
		// basePrice: Joi.string()
		// 	.regex(/^d+(.d{2})?$/)
		// 	.required(),
		basePrice: Joi.number().min(0).required(),
		discount: Joi.number().min(0).max(90).required(),
		details: Joi.array().items({
			color: Joi.string().required(),
			quantityPerSize: Joi.array().items({
				size: Joi.string().min(1).max(5).required(),
				quantity: Joi.number().min(0).required(),
			}),
		}),
	});

	return schema.validate(obj);
};

module.exports.Product = Product;
module.exports.validate = validateProduct;

const mongoose = require("mongoose");
const Joi = require("joi");

const quantityPerSizeSchema = new mongoose.Schema({
	size: {
		type: String,
		minlength: 1,
		maxlength: 8,
		uppercase: true,
		required: true,
	},
	quantity: {
		type: Number,
		min: 0,
		required: true,
	},
});

const productOptionSchema = new mongoose.Schema({
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

const productSchema = new mongoose.Schema(
	{
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
			required: true,
		},
		subCategory: {
			type: String,
			minlength: 3,
			maxlength: 100,
			required: true,
		},
		description: {
			type: String,
			minlength: 3,
			maxlength: 1000,
			required: true,
		},
		price: {
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
		options: {
			type: [productOptionSchema],
			required: true,
		},
		sold: {
			type: Number,
			default: 0,
		},
		createdAt: { type: Date, default: Date.now },
	},
	{
		toJSON: { getters: true },
	}
);

const Product = mongoose.model("Product", productSchema);

const validateProduct = (obj) => {
	const schema = Joi.object({
		name: Joi.string().min(3).max(255).required(),
		category: Joi.string().min(3).max(100).required(),
		subCategory: Joi.string().min(3).max(100).required(),
		description: Joi.string().min(3).max(1000).required(),
		price: Joi.number().min(0).required(),
		discount: Joi.number().min(0).max(90).required(),
		options: Joi.array().items({
			img: Joi.array().items(Joi.string()),
			color: Joi.string().required(),
			quantityPerSize: Joi.array().items({
				size: Joi.string().min(1).max(8).required(),
				quantity: Joi.number().min(1).required().messages({
					"number.empty": `"Quantity" cannot be empty`,
					"number.min": `"Quantity" must be greater than or equal to 1`,
					"number.base": `"Quantity" must be a type of number`,
					"any.required": `"Quantity" is a required field`,
				}),
				_id: Joi.objectId(),
			}),
			_id: Joi.objectId(),
		}),
	});

	return schema.validate(obj);
};

module.exports.Product = Product;
module.exports.validate = validateProduct;

const mongoose = require("mongoose");
const Joi = require("joi");

const cartSchema = new mongoose.Schema({
	productId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Product",
		required: true,
	},
	color: {
		type: String,
		lowercase: true,
		required: true,
	},
	size: {
		type: String,
		minlength: 1,
		maxlength: 5,
		uppercase: true,
		required: true,
	},
	quantity: {
		type: Number,
		min: 1,
		required: true,
	},
});

const orderSchema = new mongoose.Schema({
	userId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
	},
	cart: {
		type: [cartSchema],
		required: true,
	},
	address: {
		type: String,
		minlength: 5,
		maxlength: 255,
		required: true,
	},
	paymentMethod: {
		type: String,
		lowercase: true,
		enum: ["cod", "paypal"],
		default: "cod",
	},
	createdAt: { type: Date, default: Date.now },
});

const Order = mongoose.model("Order", orderSchema);

const validateOrder = (obj) => {
	const schema = Joi.object({
		userId: Joi.objectId(),
		cart: Joi.array().items({
			productId: Joi.objectId().required(),
			color: Joi.string().required(),
			size: Joi.string().min(1).max(5).required(),
			quantity: Joi.number().min(1).required(),
		}),
		address: Joi.string().min(5).max(255).required(),
		paymentMethod: Joi.string().valid("cod", "paypal"),
	});

	return schema.validate(obj);
};

module.exports.Order = Order;
module.exports.validate = validateOrder;

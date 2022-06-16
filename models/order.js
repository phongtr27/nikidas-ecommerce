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

const orderSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			minlength: 3,
			maxlength: 255,
			required: true,
		},
		phone: {
			type: String,
			minlength: 10,
			maxlength: 12,
			validate: {
				validator: function (v) {
					return /([\+84|84|0]+(3|5|7|8|9|1[2|6|8|9]))+([0-9]{8})\b/.test(
						v
					);
				},
				message: "Please enter a valid phone number.",
			},
			required: true,
		},
		email: {
			type: String,
			trim: true,
			lowercase: true,
			validate: {
				validator: function (v) {
					return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(
						v
					);
				},
				message: "Please enter a valid email.",
			},
			required: [true, "Email required"],
		},
		note: {
			type: String,
			minlength: 3,
			maxlength: 255,
		},
		address: {
			type: String,
			minlength: 5,
			maxlength: 255,
			required: true,
		},
		cart: {
			type: [cartSchema],
			required: true,
		},
		status: {
			type: String,
			lowercase: true,
			enum: ["pending", "delivered"],
			default: "pending",
		},
		price: {
			type: Number,
			min: 0.01,
			get: (v) => (v / 100).toFixed(2),
			set: (v) => v * 100,
		},
		createdAt: { type: Date, default: Date.now },
	},
	{
		toJSON: { getters: true },
	}
);

const Order = mongoose.model("Order", orderSchema);

const validateOrder = (obj) => {
	const schema = Joi.object({
		name: Joi.string().min(3).max(255).required(),
		phone: Joi.string()
			.min(10)
			.max(12)
			.regex(/([\+84|84|0]+(3|5|7|8|9|1[2|6|8|9]))+([0-9]{8})\b/)
			.messages({
				"string.pattern.base": `Please enter a valid phone number.`,
			})
			.required(),
		email: Joi.string()
			.email({
				minDomainSegments: 2,
				tlds: { allow: ["com", "net"] },
			})
			.messages({
				"string.pattern.base": `Please enter a valid email.`,
			})
			.required(),
		note: Joi.string().min(3).max(255),
		address: Joi.string().min(5).max(255).required(),
		cart: Joi.array().items({
			productId: Joi.objectId().required(),
			color: Joi.string().required(),
			size: Joi.string().min(1).max(5).required(),
			quantity: Joi.number().min(1).required(),
		}),
		status: Joi.string().valid("pending", "delivered"),
		price: Joi.number().min(0.01).required(),
	});

	return schema.validate(obj);
};

module.exports.Order = Order;
module.exports.validate = validateOrder;

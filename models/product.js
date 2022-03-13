const mongoose = require("mongoose");

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
});

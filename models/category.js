const mongoose = require("mongoose");
const Joi = require("joi");

const categorySchema = new mongoose.Schema({
	name: {
		type: String,
		minlength: 3,
		maxlength: 100,
		required: true,
	},
	img: {
		type: String,
		required: true,
	},
});

const Category = mongoose.model("Category", categorySchema);

const validateCategory = (obj) => {
	const schema = Joi.object({
		name: Joi.string().min(3).max(100).required(),
	});
	return schema.validate(obj);
};

exports.Category = Category;
exports.validate = validateCategory;

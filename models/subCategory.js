const mongoose = require("mongoose");
const Joi = require("joi");

const subCategorySchema = new mongoose.Schema({
	name: {
		type: String,
		minlength: 3,
		maxlength: 100,
		required: true,
	},
	category: {
		type: String,
		minlength: 3,
		maxlength: 100,
		required: true,
	},
});

const SubCategory = mongoose.model("SubCategory", subCategorySchema);

const validateSubCategory = (obj) => {
	const schema = Joi.object({
		name: Joi.string().min(3).max(100).required(),
		category: Joi.string().min(3).max(100).required(),
	});

	return schema.validate(obj);
};

module.exports.SubCategory = SubCategory;
module.exports.validate = validateSubCategory;

const mongoose = require("mongoose");
const Joi = require("joi");

const subCategorySchema = new mongoose.Schema({
	name: {
		type: String,
		minlength: 3,
		maxlength: 100,
		lowercase: true,
		required: true,
	},
	parentId: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
});

const SubCategory = mongoose.model("SubCategory", subCategorySchema);

const validateSubCategory = (obj) => {
	const schema = Joi.object({
		name: Joi.string().min(3).required(),
		parentId: Joi.objectId(),
	});

	return schema.validate(obj);
};

module.exports.SubCategory = SubCategory;
module.exports.validate = validateSubCategory;

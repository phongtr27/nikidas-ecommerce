const Joi = require("joi");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
require("mongoose-type-email");

const userSchema = new mongoose.Schema({
	email: {
		type: mongoose.SchemaTypes.Email,
		unique: true,
		minlength: 5,
		maxlength: 255,
		required: true,
	},
	name: {
		type: String,
		minlength: 3,
		maxlength: 255,
		required: true,
	},
	password: {
		type: String,
		minlength: 5,
		maxlength: 255,
		required: true,
	},
	isAdmin: {
		type: Boolean,
		default: false,
	},
	address: {
		type: String,
		minlength: 5,
		maxlength: 255,
	},
});

userSchema.methods.generateAuthToken = function () {
	const token = jwt.sign(
		{
			_id: this._id,
			email: this.email,
			name: this.name,
			address: this.address,
			isAdmin: this.isAdmin,
		},
		process.env.jwtPrivateKey
	);
	return token;
};

const User = mongoose.model("User", userSchema);

const validateUser = (obj) => {
	const schema = Joi.object({
		email: Joi.string()
			.email({
				minDomainSegments: 2,
				tlds: { allow: ["com", "net"] },
			})
			.required(),
		name: Joi.string().min(3).max(255).required(),
		password: Joi.string().max(5).max(255).required(),
		address: Joi.string().min(5).max(255),
	});
	return schema.validate(obj);
};

module.exports.User = User;
module.exports.validate = validateUser;

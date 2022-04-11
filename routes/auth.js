const express = require("express");
const Joi = require("joi");
const bcrypt = require("bcrypt");
const sendErr = require("../helpers/sendError");
const { User } = require("../models/user");

const router = express.Router();

router.post("/", async (req, res, err) => {
	const { error } = validate(req.body);
	if (error) return sendErr(res, 400, error.details[0].message);

	const user = await User.findOne({ email: req.body.email });
	if (!user) return sendErr(res, 400, "Email or password is incorrect.");

	const isValidPassword = await bcrypt.compare(
		req.body.password,
		user.password
	);
	if (!isValidPassword)
		return sendErr(res, 400, "Email or password is incorrect.");

	const token = user.generateAuthToken();
	res.send({ token });
});

const validate = (obj) => {
	const schema = Joi.object({
		email: Joi.string()
			.email({
				minDomainSegments: 2,
				tlds: { allow: ["com", "net"] },
			})
			.required(),
		password: Joi.string().min(5).max(255).required(),
	});
	return schema.validate(obj);
};

module.exports = router;

const express = require("express");
const Joi = require("joi");
const bcrypt = require("bcrypt");
const { User } = require("../models/user");

const router = express.Router();

router.post("/", async (req, res, err) => {
	const { error } = validate(req.body);
	if (error) return res.status(400).send(error.details[0].message);

	const user = await User.findOne({ email: req.body.email });
	if (!user) return res.status(400).send("Email or password is incorrect.");

	const isValidPassword = await bcrypt.compare(
		req.body.password,
		user.password
	);
	if (!isValidPassword)
		return res.status(400).send("Email or password is incorrect.");

	const token = user.generateAuthToken();
	res.send(token);
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

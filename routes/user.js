const express = require("express");
const bcrypt = require("bcrypt");
const { User, validate } = require("../models/user");
const sendErr = require("../helpers/sendError");
const auth = require("../middleware/auth");

const router = express.Router();

router.get("/me", auth, async (req, res) => {
	const user = await User.findById(req.user._id).select("-password");
	res.send(user);
});

router.post("/", async (req, res, err) => {
	const { error } = validate(req.body);
	if (error) return sendErr(res, 400, error.details[0].message);

	let user = await User.findOne({ email: req.body.email });
	if (user) return sendErr(res, 400, "User already registered.");

	user = new User({
		name: req.body.name,
		email: req.body.email,
		password: req.body.password,
		address: req.body.address,
	});
	const salt = await bcrypt.genSalt(10);
	user.password = await bcrypt.hash(user.password, salt);
	await user.save();

	const token = user.generateAuthToken();

	res.send({ token });
});

module.exports = router;

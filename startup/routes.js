const express = require("express");
const cors = require("cors");
const category = require("../routes/category");
const subCategory = require("../routes/subCategory");
const user = require("../routes/user");
const auth = require("../routes/auth");
const product = require("../routes/product");
const order = require("../routes/order");
const error = require("../middleware/error");

module.exports = function (app) {
	app.use(cors());
	app.use(express.json());
	app.use("/public", express.static("public"));
	app.use("/api/category", category);
	app.use("/api/sub-category", subCategory);
	app.use("/api/user", user);
	app.use("/api/auth", auth);
	app.use("/api/product", product);
	app.use("/api/order", order);
	app.use(error);
};

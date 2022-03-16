require("dotenv").config();
require("express-async-errors");
const express = require("express");
const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);
const logger = require("./helpers/logger");
const mongoose = require("mongoose");
const error = require("./middleware/error");
const category = require("./routes/category");
const subCategory = require("./routes/subCategory");
const user = require("./routes/user");
const auth = require("./routes/auth");
const product = require("./routes/product");

const app = express();
app.use(express.json());
app.use(express.static("./public"));

mongoose.connect(
	process.env.DB,
	{
		useNewUrlParser: true,
		useUnifiedTopology: true,
	},
	() => logger.info("Connected to MongoDB")
);

app.use("/api/category", category);
app.use("/api/sub-category", subCategory);
app.use("/api/user", user);
app.use("/api/auth", auth);
app.use("/api/product", product);
app.use(error);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => logger.info(`listening on port ${PORT}...`));

require("dotenv").config();
require("express-async-errors");
const express = require("express");
const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);
const logger = require("./helpers/logger");
const mongoose = require("mongoose");

const app = express();

mongoose.connect(
	process.env.DB,
	{
		useNewUrlParser: true,
		useUnifiedTopology: true,
	},
	() => logger.info("Connected to MongoDB")
);

require("./startup/routes")(app);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => logger.info(`listening on port ${PORT}...`));

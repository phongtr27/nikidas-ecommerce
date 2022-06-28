require("dotenv").config();
require("express-async-errors");
const logger = require("./helpers/logger");

const express = require("express");
const app = express();

require("./startup/db")();
require("./startup/validation")();
require("./startup/routes")(app);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => logger.info(`listening on port ${PORT}...`));

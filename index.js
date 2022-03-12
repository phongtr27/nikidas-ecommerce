require("dotenv").config();
require("express-async-errors");
const express = require("express");
const logger = require("./startup/logger");
const mongoose = require("mongoose");
const category = require("./routes/category");
const error = require("./middleware/error");

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
app.use(error);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => logger.info(`listening on port ${PORT}...`));

const fs = require("fs");
const express = require("express");
const { Category, validate } = require("../models/category");
const upload = require("../middleware/uploadImage");

const router = express.Router();

router.get("/", async (req, res, err) => {
  const categories = await Category.find();
  res.send(categories);
});

router.get("/:id", async (req, res, err) => {
  const category = await Category.findById(req.params.id);

  if (!category)
    return res.status(404).send("Category with given ID not found.");

  res.send(category);
});

router.post("/", upload.single("category"), async (req, res, err) => {
  const { error } = validate(req.body);
  if (error) {
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) {
          console.log(err);
        }
      });
    }

    return res.status(400).send(error.details[0].message);
  }

  if (!req.file)
    return res.status(400).send("Please choose an image to upload.");

  const item = new Category({
    name: req.body.name,
    img: req.file.path.slice(6),
  });
  await item.save();
});

router.delete("/:id", async (req, res, err) => {
  const category = await Category.findByIdAndDelete(req.params.id);

  if (!category)
    return res.status(404).send("Category with given ID not found.");

  return res.send(category);
});

module.exports = router;

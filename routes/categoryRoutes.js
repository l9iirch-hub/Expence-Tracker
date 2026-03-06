const express = require("express");
const router = express.Router();
const Category = require("../models/Category");

router.post("/", async (req, res) => {
  const category = await Category.create(req.body);
  res.status(201).json(category);
});

router.get("/", async (req, res) => {
  const categories = await Category.find();
  res.json(categories);
});

module.exports = router;
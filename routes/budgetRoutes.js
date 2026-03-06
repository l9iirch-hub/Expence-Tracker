const express = require("express");
const router = express.Router();
const Budget = require("../models/Budget");

router.post("/", async (req, res) => {
  const budget = await Budget.create(req.body);
  res.status(201).json(budget);
});

router.get("/", async (req, res) => {
  const budgets = await Budget.find().populate("category");
  res.json(budgets);
});

module.exports = router;
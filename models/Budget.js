const mongoose = require("mongoose");

const budgetSchema = new mongoose.Schema({
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true
  },
  month: {
    type: Number,
    required: true
  },
  year: {
    type: Number,
    required: true
  },
  limitAmount: {
    type: Number,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model("Budget", budgetSchema);
const mongoose = require("mongoose");
import Category from "./Category";
import User from "./User";

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  author: {
    type: String,
    required: true,
  },
  publisher: {
    type: String,
    required: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: Category,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  Condition: {
    type: String,
    required: true,
    enum: ["new", "used"],
  },
  description: {
    type: String,
    required: true,
  },
  image: {
    type: [String],
    required: true,
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: User,
    required: true,
  },
  stock: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    required: true,
    enum: ["latest", "trending", "popular", "best-seller", "sold-out"],
  },
  isListed: {
    type: Boolean,
    required: true,
  },
});

module.exports = mongoose.model("Book", bookSchema);

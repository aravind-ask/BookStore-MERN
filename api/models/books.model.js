import mongoose from "mongoose";
import Category from "./category.model.js";
import User from "./user.model.js";

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
    type: String,
    // ref: Category,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  stock: {
    type: Number,
    required: true,
  },
  Condition: {
    type: String,
    enum: ["New", "Used"],
  },
  description: {
    type: String,
    required: true,
  },
  images: {
    type: [String],
    required: true,
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: User,
  },
  stock: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ["latest", "trending", "popular", "best-seller", "sold-out"],
  },
  isListed: {
    type: Boolean,
    default: true,
  },
});

const Book = mongoose.model("Book", bookSchema);

export default Book;

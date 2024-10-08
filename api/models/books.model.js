import mongoose from "mongoose";
import Category from "./category.model.js";
import User from "./user.model.js";

const bookSchema = new mongoose.Schema(
  {
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
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    images: {
      type: [String],
      required: true,
      default: [
        "https://firebasestorage.googleapis.com/v0/b/rebook-mern.appspot.com/o/1728369326265-sample-sd.jpg?alt=media&token=37523efe-507b-484e-9a80-75e14dee9ada",
        "https://firebasestorage.googleapis.com/v0/b/rebook-mern.appspot.com/o/1728369326265-sample-sd.jpg?alt=media&token=37523efe-507b-484e-9a80-75e14dee9ada",
      ],
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
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
    slug: {
      type: String,
      required: true,
      unique: true,
    },
  },
  { timestamps: true }
);

const Book = mongoose.model("Book", bookSchema);

export default Book;

// controllers/book.controller.js
import express from "express";
import { errorHandler } from "../utils/error.js";
import { Book } from "../models/Book.js";
import { Category } from "../models/Category.js";

export const addBook = async (req, res, next) => {
  const {
    title,
    author,
    publisher,
    category,
    price,
    description,
    image,
    status,
  } = req.body;

  if (
    !title ||
    !author ||
    !publisher ||
    !category ||
    !price ||
    !description ||
    !image ||
    !status
  ) {
    return next(errorHandler(400, "All fields are required"));
  }

  const categoryObj = await Category.findOne({ category });

  if (!categoryObj) {
    return next(errorHandler(404, "Category not found"));
  }

  const newBook = new Book({
    title,
    author,
    publisher,
    category: categoryObj._id,
    price,
    description,
    image,
    status,
  });

  try {
    await newBook.save();
    res.status(200).json({ message: "Book added successfully" });
  } catch (error) {
    next(error);
  }
};

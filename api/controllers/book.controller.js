// controllers/book.controller.js
import express from "express";
import { errorHandler } from "../utils/error.js";
import Book from "../models/books.model.js";
import jwt from "jsonwebtoken";

// import  Category  from "../models/category.model.js";

export const addBook = async (req, res, next) => {
  const {
    title,
    author,
    publisher,
    category,
    price,
    description,
    images, // assuming images is an array of image URLs or objects
    stock,
    condition,
  } = req.body;

  if (
    !title ||
    !author ||
    !publisher ||
    !category ||
    !price ||
    !description ||
    !images ||
    !stock ||
    !condition
  ) {
    return next(errorHandler(400, "All fields are required"));
  }
  const userId = jwt.verify(
    req.token,
    process.env.SECRET_KEY,
    (err, decoded) => {
      if (err) {
        return null; // or throw an error
      }
      return decoded.id; // assuming the user ID is stored in the token with key 'userId'
    }
  );
  const newBook = new Book({
    title,
    author,
    publisher,
    category,
    price,
    stock,
    condition,
    description,
    images: [...images], // spread the images array into the Book model
    seller: req.user.id, // insert the current user's ID into the seller field
  });

  try {
    await newBook.save();
    res.status(200).json({ message: "Book added successfully" });
  } catch (error) {
    next(error);
  }
};

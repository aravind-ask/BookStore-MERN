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
  const slug = req.body.title
    .split(" ")
    .join("-")
    .toLowerCase()
    .replace(/[^a-zA-Z0-9-]/g, "");
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
    slug,
  });

  try {
    await newBook.save();
    return next(errorHandler(200, "Book added successfully"));
  } catch (error) {
    next(error);
  }
};

export const getBooks = async (req, res, next) => {
  try {
    const startIndex = parseInt(req.query.startIndex) || 0;
    const limit = parseInt(req.query.limit) || 9;
    const sortDirection = req.query.order === "asc" ? 1 : -1;
    const books = await Book.find({
      ...(req.query.userId && { userId: req.query.userId }),
      ...(req.query.category && { category: req.query.category }),
      ...(req.query.slug && { slug: req.query.slug }),
      ...(req.query.bookId && { _id: req.query.bookId }),
      ...(req.query.searchTerm && {title: { $regex: req.query.searchTerm, $options: "i" },
      }),
    })
      .sort({ updatedAt: sortDirection })
      .skip(startIndex)
      .limit(limit);

    const totalBooks = await Book.countDocuments();

    const now = new Date();

    const oneMonthAgo = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      now.getDate()
    );

    const lastMonthBooks = await Book.countDocuments({
      createdAt: { $gte: oneMonthAgo },
    });

    res.status(200).json({
      books,
      totalBooks,
      lastMonthBooks,
    });
  } catch (error) {
    next(error);
  }
};


export const deleteBook = async (req, res, next) => {
  const bookId = req.params.bookId;
  const userId = req.user.id;

  if (req.user.isAdmin) {
    // Admin can delete any book
    try {
      await Book.findByIdAndUpdate(bookId, { isDeleted: true });
      res.status(200).json("The book has been deleted");
    } catch (error) {
      next(error);
    }
  } else if (userId === req.params.userId) {
    // User can delete their own book
    try {
      await Book.findOneAndUpdate(
        { _id: bookId, seller: userId },
        { isDeleted: true }
      );
      res.status(200).json("The book has been deleted");
    } catch (error) {
      next(error);
    }
  } else {
    return next(errorHandler(403, "You are not allowed to delete this book"));
  }
};
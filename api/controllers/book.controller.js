// controllers/book.controller.js
import express from "express";
import { errorHandler } from "../utils/error.js";
import Book from "../models/books.model.js";
import Category from "../models/category.model.js";
import Offer from "../models/offer.model.js";
import jwt from "jsonwebtoken";

// import  Category  from "../models/category.model.js";

export const addBook = async (req, res, next) => {
  console.log(req.body);
  const {
    title,
    author,
    publisher,
    category,
    price,
    description,
    images,
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
    Condition: condition,
    description,
    images: [...images],
    seller: req.user.id,
    slug,
  });

  try {
    await newBook.save();
    return next(errorHandler(200, "Book added successfully"));
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export const getBooks = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 9;
    const skip = (page - 1) * limit;

    let filter = {};

    if (req.query.isAdmin === "true") {
      // Admins can see all books, including deleted ones
      filter = {
        ...(req.query.userId && { userId: req.query.userId }),
        ...(req.query.condition && { Condition: req.query.condition }),
        ...(req.query.seller && { seller: req.query.seller }),
        ...(req.query.title && { title: req.query.title }),
        ...(req.query.author && { author: req.query.author }),
        ...(req.query.slug && { slug: req.query.slug }),
        ...(req.query.bookId && { _id: req.query.bookId }),
        ...(req.query.searchTerm && {
          title: { $regex: req.query.searchTerm, $options: "i" },
        }),
      };
    } else {
      // Regular users can only see non-deleted books
      filter = {
        ...(req.query.userId && { userId: req.query.userId }),
        ...(req.query.condition && { Condition: req.query.condition }),
        ...(req.query.seller && { seller: req.query.seller }),
        ...(req.query.title && { title: req.query.title }),
        ...(req.query.author && { author: req.query.author }),
        ...(req.query.slug && { slug: req.query.slug }),
        ...(req.query.bookId && { _id: req.query.bookId }),
        ...(req.query.searchTerm && {
          title: { $regex: req.query.searchTerm, $options: "i" },
        }),
        isListed: true, // Only show non-deleted books for regular users
      };
    }

    // Handle category filtering
    if (req.query.category) {
      if (req.query.category === "uncategorized") {
        // No additional category filtering needed
      } else {
        filter.category = req.query.category;
      }
    }

    const sortField = req.query.sort || "updatedAt"; // Default sort field
    const sortOrder = req.query.order === "asc" ? 1 : -1; // Default to descending

    const books = await Book.find(filter)
      .sort({ [sortField]: sortOrder })
      .skip(skip)
      .limit(limit)
      .populate("category");

    const totalBooks = await Book.countDocuments(filter);

    const now = new Date();
    const oneMonthAgo = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      now.getDate()
    );

    const lastMonthBooks = await Book.countDocuments({
      ...filter,
      createdAt: { $gte: oneMonthAgo },
    });

    // Apply offers (Product & Category) for each book
    const booksWithOffers = await Promise.all(
      books.map(async (book) => {
        // Fetch product-specific offers
        const productOffers = await Offer.find({
          applicableProducts: book._id,
          isActive: true,
        });

        // Fetch category-specific offers
        const categoryOffers = await Offer.find({
          applicableCategory: book.category._id,
          isActive: true,
        });

        // Determine the best offer (higher discount)
        let discount = 0;
        let bestOffer = null;

        if (productOffers.length > 0) {
          bestOffer = productOffers[0]; // Assume the first product offer
          discount = bestOffer.discountPercentage;
        } else if (categoryOffers.length > 0) {
          bestOffer = categoryOffers[0]; // Assume the first category offer
          discount = bestOffer.discountPercentage;
        }

        // Calculate discounted price if an offer exists
        const discountedPrice = discount
          ? book.price - (book.price * discount) / 100
          : book.price;

        return {
          ...book._doc,
          discountedPrice,
          bestOffer,
        };
      })
    );

    res.status(200).json({
      books: booksWithOffers, // Return books with offers applied
      totalBooks,
      lastMonthBooks,
      currentPage: page,
      totalPages: Math.ceil(totalBooks / limit),
    });
  } catch (error) {
    console.log(error);
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

export const updateBook = async (req, res, next) => {
  if (!req.user.isAdmin || req.user.id !== req.params.userId) {
    return next(errorHandler(403, "You are not allowed to update this post"));
  }
  try {
    const updatedBook = await Book.findByIdAndUpdate(
      req.params.bookId,
      {
        $set: {
          title: req.body.title,
          author: req.body.author,
          publisher: req.body.publisher,
          price: req.body.price,
          description: req.body.description,
          Condition: req.body.condition,
          category: req.body.category,
          images: req.body.images,
          stock: req.body.stock,
        },
      },
      { new: true }
    );
    res.status(200).json(updatedBook);
  } catch (error) {
    next(error);
  }
};

export const listBook = async (req, res, next) => {
  try {
    const { bookId } = req.params;
    const book = await Book.findById(bookId);

    if (!book) {
      return next(errorHandler(404, "Book not found"));
    }

    book.isListed = true;
    await book.save();

    res.status(200).json({ message: "Book listed successfully", book });
  } catch (error) {
    next(error);
  }
};

// Unlist a book
export const unlistBook = async (req, res, next) => {
  try {
    const { bookId } = req.params;
    const book = await Book.findById(bookId);

    if (!book) {
      return next(errorHandler(404, "Book not found"));
    }

    book.isListed = false;
    await book.save();

    res.status(200).json({ message: "Book unlisted successfully", book });
  } catch (error) {
    next(error);
  }
};

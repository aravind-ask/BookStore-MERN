import Wishlist from "../models/wishlist.model.js";
import { errorHandler } from "../utils/error.js";

export const addToWishlist = async (req, res, next) => {
  try {
    const { bookId, userId, title, userName, price, images, slug, author } = req.body;
    const existing = await Wishlist.findOne({ bookId, userId });
    if (existing) {
      return errorHandler(400, "Book already in wishlist");
    }
    const newWishlist = new Wishlist({
      bookId,
      userId,
      title,
      userName,
      price,
      images,
      slug,
      author
    });
    await newWishlist.save();
    res.status(201).json("Book added to wishlist"); 
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export const getWishlist = async (req, res, next) => {
  try {
    const userId = req.params.userId;
    const wishlist = await Wishlist.find({ userId });
    if (!wishlist) {
      return next(errorHandler(404, "Wishlist not found"));
    }
    res.status(200).json(wishlist);
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export const checkIfInWishlist = async (req, res, next) => {
  try {
    const { bookId, userId } = req.query; // Get bookId and userId from query parameters

    // Check if both bookId and userId are provided
    if (!bookId || !userId) {
      return next(errorHandler(400, "Book ID and User ID are required"));
    }

    // Check if the book is in the user's wishlist
    const existing = await Wishlist.findOne({ bookId, userId });

    // Respond with the existence status
    if (existing) {
      return res.status(200).json({ exists: true });
    } else {
      return res.status(200).json({ exists: false });
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
};


export const removeFromWishlist = async (req, res, next) => {
  try {
    const { bookId, userId } = req.body; // Expecting bookId and userId in the request body

    // Check if both bookId and userId are provided
    if (!bookId || !userId) {
      return next(errorHandler(400, "Book ID and User ID are required"));
    }

    // Use findOneAndDelete to remove the item based on bookId and userId
    const removedItem = await Wishlist.findOneAndDelete({ bookId, userId });

    if (!removedItem) {
      return next(errorHandler(404, "Book not found in wishlist"));
    }

    res.status(200).json("Book removed from wishlist");
  } catch (error) {
    console.log(error);
    next(error);
  }
};
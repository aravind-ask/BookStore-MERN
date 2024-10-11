import Wishlist from "../models/wishlist.model.js";
import { errorHandler } from "../utils/error.js";

export const addToWishlist = async (req, res, next) => {
  try {
    const { bookId, userId, title, userName, price, images, slug, author } = req.body;
    const existing = await Wishlist.findOne({ bookId, userId }); // Find a document with matching bookId and userId
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
    await newWishlist.save(); // Await the promise returned by save()
    res.status(201).json("Book added to wishlist"); // Use 201 Created instead of 200 OK
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

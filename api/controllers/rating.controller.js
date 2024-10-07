import Rating from "../models/rating.model.js";
import { errorHandler } from "../utils/error.js";

export const createRating = async (req, res, next) => {
  try {
    const { rating, starRating, bookId, userId } = req.body;

    if (!rating || typeof rating !== "string") {
      return errorHandler(res, 400, "Invalid rating");
    }

    if (!starRating || typeof starRating !== "number") {
      return errorHandler(res, 400, "Invalid star rating");
    }

    const newRating = new Rating({
      rating,
      starRating,
      bookId,
      userId,
    });

    await newRating.save();
    res.status(201).json(newRating);
  } catch (error) {
    console.error(error);
    next(error);
  }
};

export const getRatings = async (req, res, next) => {
  try {
    const ratings = await Rating.find({ bookId: req.params.bookId }).sort({
      createdAt: -1,
    });
    res.status(200).json(ratings);
  } catch (error) {
    next(error);
  }
};



export const likeRating = async (req, res, next) => {
  try {
    const rating = await Rating.findById(req.params.ratingId);
    if (!rating) {
      return next(errorHandler(404, "rating not found"));
    }
    const userIndex = rating.likes.indexOf(req.user.id);
    if (userIndex === -1) {
      rating.numberOfLikes += 1;
      rating.likes.push(req.user.id);
    } else {
      rating.numberOfLikes -= 1;
      rating.likes.splice(userIndex, 1);
    }
    await rating.save();
    res.status(200).json(rating);
  } catch (error) {
    next(error);
  }
};

export const editRating = async (req, res, next) => {
  try {
    const rating = await Rating.findById(req.params.ratingId);
    if (!rating) {
      return next(errorHandler(404, "rating not found"));
    }
    if (rating.userId !== req.user.id && !req.user.isAdmin) {
      return next(
        errorHandler(403, "You are not allowed to edit this rating")
      );
    }

    const editedrating = await Rating.findByIdAndUpdate(
      req.params.ratingId,
      {
        rating: req.body.rating,
      },
      { new: true }
    );
    res.status(200).json(editedrating);
  } catch (error) {
    next(error);
  }
};

export const deleteRating = async (req, res, next) => {
  try {
    const rating = await Rating.findById(req.params.ratingId);
    if (!rating) {
      return next(errorHandler(404, "rating not found"));
    }
    if (rating.userId !== req.user.id && !req.user.isAdmin) {
      return next(
        errorHandler(403, "You are not allowed to delete this rating")
      );
    }
    await Rating.findByIdAndDelete(req.params.ratingId);
    res.status(200).json("rating has been deleted");
  } catch (error) {
    console.log(error)
    next(error);
  }
};

export const getAllRating = async (req, res, next) => {
  if (!req.user.isAdmin)
    return next(errorHandler(403, "You are not allowed to get all ratings"));
  try {
    const startIndex = parseInt(req.query.startIndex) || 0;
    const limit = parseInt(req.query.limit) || 9;
    const sortDirection = req.query.sort === "desc" ? -1 : 1;
    const ratings = await Rating.find()
      .sort({ createdAt: sortDirection })
      .skip(startIndex)
      .limit(limit);
    const totalRatings = await Rating.countDocuments();
    const now = new Date();
    const oneMonthAgo = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      now.getDate()
    );
    const lastMonthRatings = await Rating.countDocuments({
      createdAt: { $gte: oneMonthAgo },
    });
    res.status(200).json({ ratings, totalRatings, lastMonthRatings });
  } catch (error) {
    next(error);
  }
};

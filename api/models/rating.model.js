import mongoose from "mongoose";

const ratingSchema = mongoose.Schema(
  {
    bookId: { type: mongoose.Schema.Types.ObjectId, ref: "Book" },
    starRating: { type: Number, required: true },
    rating: { type: String, required: true },
    userId: { type: String, required: true },
    likes: {
      type: Array,
      default: [],
    },
    numberOfLikes: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const Rating = mongoose.model("Rating", ratingSchema);

export default Rating;

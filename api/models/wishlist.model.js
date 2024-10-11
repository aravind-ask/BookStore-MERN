import mongoose from "mongoose";

const wishlistSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
  },
  userName: {
    type: String,
  },
  bookId: {
    type: mongoose.Schema.Types.ObjectId,
  },
  title: {
    type: String,
  },
  author: {
    type: String,
  },
  slug:{
    type: String,
  },
  price: {
    type: Number,
  },
  images: {
    type: Array,
  },
});

const Wishlist = mongoose.model("Wishlist", wishlistSchema);

export default Wishlist;

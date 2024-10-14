import Cart from "../models/cart.model.js";
import Book from "../models/books.model.js";
import { errorHandler } from "../utils/error.js";

export const addToCart = async (req, res, next) => {
  try {
    const { userId, bookId, quantity } = req.body;
    if (!userId || !bookId || quantity < 0) {
      next(errorHandler(400, "Invalid Data Provided!"));
    }
    const book = await Book.findById(bookId);
    if (!book) {
      return next(errorHandler(404, "Book not found"));
    }
    let cart = await Cart.findOne({ userId }).populate("items.bookId");
    if (!cart) {
      cart = new Cart({ userId, items: [{ bookId, quantity }] });
    } else {
      const findCurrentBookIndex = cart.items.findIndex((item) =>
        item.bookId.equals(bookId)
      );
      if (findCurrentBookIndex === -1) {
        cart.items.push({ bookId, quantity });
      } else {
        cart.items[findCurrentBookIndex].quantity += quantity;
      }
    }
    await cart.save();
    res.status(200).json({ data: cart });
  } catch (error) {
    next(error);
  }
};

export const getCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.id }).populate({
      path: "items.bookId",
      model: "Book",
      select: "title images author price slug isListed stock",
    });
    if (!cart) {
      return res
        .status(200)
        .json({ msg: "Your cart is empty", items: [], totalPrice: 0 });
    }
    console.log("cart.items:", cart.items);
    const validItems = cart.items.filter((book) => book.bookId.isListed);
    if (validItems.length < cart.items.length) {
      cart.items = validItems;
      await cart.save();
    }
    const populateCartItems = cart.items.map((item) => ({
      bookId: item.bookId ? item.bookId._id : null,
      title: item.bookId ? item.bookId.title : "Product not Found",
      author: item.bookId ? item.bookId.author : null,
      price: item.bookId ? item.bookId.price : null,
      stock: item.bookId ? item.bookId.stock : null,
      images: item.bookId ? item.bookId.images : null,
      slug: item.bookId ? item.bookId.slug : null,
      quantity: item.quantity,
    }));
    res.status(200).json({ data: { ...cart._doc, items: populateCartItems } });
  } catch (err) {
    next(err);
  }
};

export const removeCart = async (req, res, next) => {
  try {
    const { userId, bookId } = req.params;
    if (!userId || !bookId) {
      next(errorHandler(400, "Invalid Data Provided!"));
    }
    const cart = await Cart.findOne({ userId }).populate({
      path: "items.bookId",
      model: "Book",
      select: "title images author price slug",
    });
    if (!cart) {
      return res
        .status(200)
        .json({ msg: "Your cart is empty", items: [], totalPrice: 0 });
    }
    cart.items = cart.items.filter(
      (item) => item.bookId._id.toString() !== bookId
    );
    await cart.save();
    await cart.populate({
      path: "items.bookId",
      model: "Book",
      select: "title images author price slug isListed stock",
    });
    const populateCartItems = cart.items.map((item) => ({
      bookId: item.bookId ? item.bookId._id : null,
      title: item.bookId ? item.bookId.title : "Product not Found",
      author: item.bookId ? item.bookId.author : null,
      price: item.bookId ? item.bookId.price : null,
      stock: item.bookId ? item.bookId.stock : null,
      images: item.bookId ? item.bookId.images : null,
      slug: item.bookId ? item.bookId.slug : null,
      quantity: item.quantity,
    }));
    res.status(200).json({ data: { ...cart._doc, items: populateCartItems } });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

export const updateQuantity = async (req, res, next) => {
  try {
    const { userId, bookId, quantity } = req.body;
    if (!userId || !bookId) {
      next(errorHandler(400, "Invalid Data Provided!"));
    }
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return next(errorHandler(404, "Cart not found"));
    }
    const findCurrentBookIndex = cart.items.findIndex(
      (item) => item.bookId.toString() === bookId
    );
    if (findCurrentBookIndex === -1) {
      return next(errorHandler(404, "Cart item not found"));
    }
    if (quantity === 0) {
      cart.items.splice(findCurrentBookIndex, 1);
    } else {
      cart.items[findCurrentBookIndex].quantity = quantity;
    }
    await cart.save();
    await cart.populate({
      path: "items.bookId",
      model: "Book",
      select: "title images author price slug isListed stock",
    });

    const populateCartItems = cart.items.map((item) => ({
      bookId: item.bookId ? item.bookId._id : null,
      title: item.bookId ? item.bookId.title : "Product not Found",
      author: item.bookId ? item.bookId.author : null,
      price: item.bookId ? item.bookId.price : null,
      stock: item.bookId ? item.bookId.stock : null,
      images: item.bookId ? item.bookId.images : null,
      slug: item.bookId ? item.bookId.slug : null,
      quantity: item.quantity,
    }));
    res.status(200).json({ data: { ...cart._doc, items: populateCartItems } });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

import Cart from "../models/cart.model.js";
import Book from "../models/books.model.js";
import Offer from "../models/offer.model.js";
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
      select: "title images author price slug isListed stock category",
    });

    if (!cart) {
      return res
        .status(200)
        .json({ msg: "Your cart is empty", items: [], totalPrice: 0 });
    }

    const validItems = cart.items.filter((book) => book.bookId.isListed);

    if (validItems.length < cart.items.length) {
      cart.items = validItems;
      await cart.save();
    }

    // Fetch any active offers for each book
    const populateCartItems = await Promise.all(
      cart.items.map(async (item) => {
        const book = item.bookId;

        let discountedPrice = book.price; // Default to original price
        let offerName = null;

        // Fetch active product offers
        const productOffers = await Offer.find({
          applicableProducts: book._id,
          isActive: true,
        });

        // Fetch active category offers
        const categoryOffers = await Offer.find({
          applicableCategory: book.category._id,
          isActive: true,
        });
        console.log("p: ", productOffers);
        console.log("C: ", categoryOffers);
        console.log();

        let discount = 0;
        let bestOffer = null;

        if (productOffers.length > 0) {
          bestOffer = productOffers[0]; // Assume the first product offer
          discount = bestOffer.discountPercentage;
          offerName = bestOffer.title;
        } else if (categoryOffers.length > 0) {
          bestOffer = categoryOffers[0]; // Assume the first category offer
          discount = bestOffer.discountPercentage;
          offerName = bestOffer.title;
        }

        // Calculate discounted price if an offer exists
        discountedPrice = discount
          ? book.price - (book.price * discount) / 100
          : book.price;

        return {
          bookId: book ? book._id : null,
          title: book ? book.title : "Product not Found",
          author: book ? book.author : null,
          price: book ? book.price : null,
          discountedPrice: discountedPrice.toFixed(2), // Include the discounted price
          offerName: offerName, // Include the offer name
          stock: book ? book.stock : null,
          images: book ? book.images : null,
          slug: book ? book.slug : null,
          quantity: item.quantity,
        };
      })
    );

    // Calculate the total price with the discounted prices
    const totalPrice = populateCartItems.reduce((sum, item) => {
      return sum + item.discountedPrice * item.quantity;
    }, 0);

    res.status(200).json({
      data: {
        ...cart._doc,
        items: populateCartItems,
        totalPrice: totalPrice.toFixed(2),
      },
    });
  } catch (err) {
    console.error(err);
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

export const clearCartItems = async (req, res, next) => {
  try {
    const userId = req.params.userId;
    if (!userId) {
      return next(errorHandler(400, "Invalid Data Provided!"));
    }
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return next(errorHandler(404, "Cart not found"));
    }

    cart.items = [];

    await cart.save();
    res.status(200).json({ data: { ...cart._doc, items: [] } });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

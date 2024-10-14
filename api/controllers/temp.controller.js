import Cart from "../models/cart.model.js";
import Book from "../models/books.model.js";

export const addToCart = async (req, res, next) => {
  const { bookId, quantity } = req.body;

  if (quantity <= 0 || !Number.isInteger(quantity)) {
    return res.status(400).json({ msg: "Invalid quantity" });
  }

  try {
    let cart = await Cart.findOne({ userId: req.user.id });
    const book = await Book.findById(bookId);

    if (!book) {
      return res.status(404).json({ msg: "Book not found" });
    }

    if (!cart) {
      // Create a new cart if none exists
      cart = new Cart({
        userId: req.user.id,
        items: [{ bookId, quantity, price: book.price }],
        totalPrice: book.price * quantity,
      });
    } else {
      // Check if the book already exists in the cart
      const existingItemIndex = cart.items.findIndex(
        (item) => item.bookId.toString() === bookId
      );

      if (existingItemIndex !== -1) {
        // Update quantity and total price
        const newQuantity = cart.items[existingItemIndex].quantity + quantity;
        if (newQuantity <= 0) {
          // Remove the item from the cart if the quantity is 0 or less
          cart.items.splice(existingItemIndex, 1);
        } else {
          cart.items[existingItemIndex].quantity = newQuantity;
          cart.totalPrice += book.price * quantity;
        }
      } else {
        // Add new item to cart
        cart.items.push({ bookId, quantity, price: book.price });
        cart.totalPrice += book.price * quantity;
      }
    }

    await cart.save();
    res.status(200).json(cart);
  } catch (err) {
    console.error(err);
    next(err);
  }
};

export const getCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.id }).populate(
      "items.bookId"
    );
    if (!cart) {
      return res
        .status(200)
        .json({ msg: "Your cart is empty", items: [], totalPrice: 0 });
    }
    res.status(200).json(cart);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};

export const removeCart = async (req, res, next) => {
  const { bookId } = req.body;
  console.log(bookId);
  console.log(req.user.id);

  try {
    const cart = await Cart.findOne({ userId: req.user.id });
    const book = await Book.findById(bookId._id);

    if (!cart || !book) {
      return res.status(404).json({ msg: "Cart or book not found" });
    }

    const updatedItems = cart.items.filter(
      (item) => item.bookId.toString() !== bookId._id
    );
    cart.items = updatedItems;
    cart.totalPrice -= book.price; // Subtract the price of the removed item

    await cart.save();
    res.status(200).json(cart);
  } catch (err) {
    console.error(err);
    next(err);
  }
};

export const updateQuantity = async (req, res, next) => {
  const { bookId, quantity } = req.body;
  console.log(bookId);
  console.log(req.user.id);

  if (quantity <= 0 || !Number.isInteger(quantity)) {
    return res.status(400).json({ msg: "Invalid quantity" });
  }

  try {
    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) {
      return res.status(404).json({ msg: "Cart not found" });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.bookId.toString() === bookId._id
    );
    if (itemIndex === -1) {
      return res.status(404).json({ msg: "Cart item not found" });
    }

    cart.items[itemIndex].quantity = quantity;

    const totalPrice = cart.items.reduce((acc, item) => {
      if (item.price && item.quantity) {
        return acc + item.price * item.quantity;
      }
      return acc;
    }, 0);

    cart.totalPrice = totalPrice;

    await cart.save();
    res.status(200).json(cart);
  } catch (err) {
    console.error(err);
    next(err);
  }
};

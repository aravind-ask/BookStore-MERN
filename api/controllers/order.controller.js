import Book from "../models/books.model.js";
import Order from "../models/order.model.js";
import { errorHandler } from "../utils/error.js";

export const placeOrder = async (req, res, next) => {
  try {
    const { cartItems, selectedAddress, paymentMethod, orderSummary } =
      req.body;
    console.log(cartItems.items);

    const outOfStockItems = [];
    for (const item of cartItems.items) {
      const book = await Book.findById(item.bookId);
      if (!book || book.stock < item.quantity) {
        outOfStockItems.push(item.title);
      }
    }

    if (outOfStockItems.length > 0) {
      return next(
        errorHandler(
          400,
          `The following books are out of stock: ${outOfStockItems.join(", ")}`
        )
      );
    }

    if (paymentMethod === "cash_on_delivery") {
      const order = new Order({
        userid: req.user._id,
        user: req.user.name,
        cartItems: cartItems.items.map((item) => ({
          bookId: item.bookId,
          book: item.title,
          images: item.images,
          price: item.price,
          discount: item.discount,
          quantity: item.quantity,
          status: item.status,
        })),
        addressId: selectedAddress._id,
        paymentMethod,
        paymentStatus: "pending",
        status: "pending",
      });

      cartItems.items.forEach(async (item) => {
        await Book.updateOne(
          { _id: item.bookId },
          { $inc: { stock: -item.quantity } }
        );
      });

      await order.save();
      res.json({ message: "Order placed successfully" });
    } else {
      return next(errorHandler(400, "Invalid payment method"));
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
};

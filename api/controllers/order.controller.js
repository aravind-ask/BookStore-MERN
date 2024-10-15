import Book from "../models/books.model.js";
import Order from "../models/order.model.js";
import { errorHandler } from "../utils/error.js";

export const placeOrder = async (req, res, next) => {
  try {
    const { cartItems, selectedAddress, paymentMethod, orderSummary } =
      req.body;
    console.log(req.body);

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
      const orderNumber = generateOrderNumber(); // generate a unique order number
      const order = new Order({
        orderNumber,
        userId: req.user.id,
        user: req.user.name,
        cartItems: cartItems.items.map((item) => ({
          bookId: item.bookId,
          book: item.title,
          images: item.images,
          price: item.price,
          discount: item.discount,
          quantity: item.quantity,
          status: item.status,
          orderDate: new Date(),
        })),
        addressId: selectedAddress._id,
        paymentMethod,
        orderSummary,
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


export const getOrders = async (req, res, next) => {
  try {
    let orders;
    if (req.user.isAdmin) {
      // If the user is an admin, retrieve all orders
      orders = await Order.find().populate("userId").populate("addressId");
    } else {
      // If the user is not an admin, retrieve orders for the specified user ID
      const userId = req.params.userId || req.user.id;
      orders = await Order.find({ userId })
        .populate("userId")
        .populate("addressId");
    }
    res.json(orders);
  } catch (error) {
    console.log(error);
    next(error);
  }
};

function generateOrderNumber() {
  const date = new Date();
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = date.getHours();
  const minute = date.getMinutes();
  const second = date.getSeconds();
  const random = Math.floor(Math.random() * 1000);

  return `ORD-${year}${month}${day}${hour}${minute}${second}${random}`;
}


// Update order item status
export const updateOrderItemStatus = async (req, res, next) => {
  try {
    const orderId = req.params.orderId;
    const itemId = req.params.itemId;
    const newStatus = req.body.status;

    // Validate the new status
    if (!["pending", "shipped", "delivered", "cancelled"].includes(newStatus)) {
      return next(errorHandler(400, "Invalid status"));
    }

    // Find the order and item
    const order = await Order.findById(orderId);
    if (!order) {
      return next(errorHandler(404, "Order not found"));
    }

    const item = order.cartItems.find((item) => item._id.toString() === itemId);
    if (!item) {
      return next(errorHandler(404, "Item not found"));
    }

    // Update the item status
    item.status = newStatus;
    await order.save();

    res.json({ message: "Order item status updated successfully" });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
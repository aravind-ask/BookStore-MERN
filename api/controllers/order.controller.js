import Book from "../models/books.model.js";
import Order from "../models/order.model.js";
import Wallet from "../models/wallet.model.js";
import Coupon from "../models/coupon.model.js";
import Offer from "../models/offer.model.js";
import { errorHandler } from "../utils/error.js";
import Razorpay from "razorpay";
import { PDFDocument, rgb } from "pdf-lib";
import crypto from "crypto";
import dotenv from "dotenv";
dotenv.config();

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export const placeOrder = async (req, res, next) => {
  try {
    const { cartItems, selectedAddress, paymentMethod, orderSummary } =
      req.body;
    console.log(req.body);

    const outOfStockItems = [];
    const updatedCartItems = [];

    // Step 1: Check stock availability and apply offers
    for (const item of cartItems.items) {
      const book = await Book.findById(item.bookId).populate("category");

      if (!book || book.stock < item.quantity) {
        outOfStockItems.push(item.title);
      } else {
        // Step 2: Apply offers (Product Offers, Category Offers)
        let discount = 0;
        let finalPrice = book.price;

        // Fetch product-specific offers
        const productOffers = await Offer.find({
          applicableProducts: book._id,
          isActive: true,
        });

        // Fetch category-specific offers
        const categoryOffers = await Offer.find({
          applicableCategory: book.category._id,
          isActive: true,
        });

        // Determine the best discount (product > category)
        if (productOffers.length > 0) {
          discount = productOffers[0].discountPercentage;
        } else if (categoryOffers.length > 0) {
          discount = categoryOffers[0].discountPercentage;
        }

        if (discount > 0) {
          finalPrice = book.price - (book.price * discount) / 100;
        }

        updatedCartItems.push({
          ...item,
          price: finalPrice,
          discount: discount,
        });
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
    let totalAmountWithOffers = updatedCartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    if (orderSummary.discount) {
      totalAmountWithOffers -= orderSummary.discount;
    }

    if (paymentMethod === "COD") {
      if (totalAmountWithOffers > 1000) {
        return next(
          errorHandler(400, "COD is not available for orders below ₹1000")
        );
      }
      const orderNumber = generateOrderNumber();
      const order = new Order({
        orderNumber,
        userId: req.user.id,
        user: req.user.name,
        cartItems: updatedCartItems.map((item) => ({
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
        orderSummary: {
          ...orderSummary,
          total: totalAmountWithOffers,
        },
      });

      // Deduct stock for each book
      updatedCartItems.forEach(async (item) => {
        await Book.updateOne(
          { _id: item.bookId },
          { $inc: { stock: -item.quantity } }
        );
      });

      await order.save();
      res.json({
        orderNo: order.orderNumber,
        message: "Order placed successfully",
      });
    } else if (paymentMethod === "Razorpay") {
      console.log("Razorpay amount:", Math.round(totalAmountWithOffers * 100));
      const options = {
        amount: Math.round(totalAmountWithOffers * 100), // Convert to paise and round to ensure it's an integer
        currency: "INR",
        receipt: generateOrderNumber(),
        payment_capture: 1,
      };

      const razorpayOrder = await razorpay.orders.create(options);

      // Create order in the database
      const newOrder = new Order({
        orderNumber: razorpayOrder.receipt,
        userId: req.user.id,
        user: req.user.name,
        cartItems: updatedCartItems.map((item) => ({
          bookId: item.bookId,
          book: item.title,
          images: item.images,
          price: item.price, // Price after applying offers
          discount: item.discount, // Applied discount
          quantity: item.quantity,
          status: item.status,
          orderDate: new Date(),
        })),
        addressId: selectedAddress._id,
        paymentMethod,
        razorpayOrderId: razorpayOrder.id,
        paymentStatus: "pending",
        orderSummary: {
          ...orderSummary,
          total: totalAmountWithOffers, // Updated total with offers
        },
      });

      await newOrder.save();

      res.status(201).json({
        success: true,
        order: razorpayOrder,
        orderId: newOrder._id,
        orderNo: newOrder.orderNumber,
        key: process.env.RAZORPAY_KEY_ID,
      });
    } else {
      return next(errorHandler(400, "Invalid payment method"));
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export const verifyPayment = async (req, res, next) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      items,
    } = req.body;

    console.log(req.body);

    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature === expectedSign) {
      // Payment is successful, update the order
      await Order.findOneAndUpdate(
        { razorpayOrderId: razorpay_order_id },
        { paymentStatus: "success", razorpayPaymentId: razorpay_payment_id }
      );
      //update the book stock
      items.forEach(async (item) => {
        await Book.updateOne(
          { _id: item.bookId },
          { $inc: { stock: -item.quantity } }
        );
      });

      return res.status(200).json({ message: "Payment verified successfully" });
    } else {
      return res.status(400).json({ message: "Invalid signature sent!" });
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export const getPaymentDetails = async (req, res, next) => {
  try {
    const orderId = req.params.orderId;
    const order = await Order.findById(orderId);
    if (!order || order.paymentMethod !== "Razorpay") {
      return res
        .status(404)
        .json({ message: "Order not found or invalid payment method" });
    }

    const options = {
      amount: Math.round(order.orderSummary.total * 100), // Convert to paise
      currency: "INR",
      receipt: order.orderNumber,
      payment_capture: 1,
    };
    const razorpayOrder = await razorpay.orders.create(options);

    // Update the order with the new razorpayOrderId
    order.razorpayOrderId = razorpayOrder.id; // Update the order with the new Razorpay order ID
    await order.save(); // Save the updated order

    res.json({ order: razorpayOrder, key: process.env.RAZORPAY_KEY_ID });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export const markPaymentFailed = async (req, res) => {
  const { orderId } = req.body; // orderId here is the Razorpay order ID
  try {
    const order = await Order.findOneAndUpdate(
      { razorpayOrderId: orderId }, // Search by Razorpay order ID
      { paymentStatus: "failed" }
    );

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({ message: "Order marked as failed" });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ message: "Failed to mark order as failed" });
  }
};



export const getOrders = async (req, res, next) => {
  try {
    let orders;
    let totalOrders;
    let lastMonthOrders;
    const limit = parseInt(req.query.limit) || 9;
    if (req.user.isAdmin) {
      // If the user is an admin, retrieve all orders
      orders = await Order.find()
        .populate("userId")
        .populate("addressId")
        .limit(limit);

      totalOrders = await Order.countDocuments();

      const now = new Date();
      const oneMonthAgo = new Date(
        now.getFullYear(),
        now.getMonth() - 1,
        now.getDate()
      );
      lastMonthOrders = await Order.countDocuments({
        createdAt: { $gte: oneMonthAgo },
      });
    } else {
      // If the user is not an admin, retrieve orders for the specified user ID
      const userId = req.user.id;
      orders = await Order.find({ userId })
        .populate("userId")
        .populate("addressId");
    }
    res.json({
      orders: orders,
      lastMonthOrders: lastMonthOrders,
      totalOrders: totalOrders,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export const getOrderDetails = async (req, res, next) => {
  try {
    const orderId = req.params.orderId;
    const order = await Order.findById(orderId)
      .populate("userId", "name email")
      .populate("addressId");

    if (!order) {
      return next(errorHandler(404, "Order not found"));
    }

    // Check if the user is authorized to view this order
    if (!req.user.isAdmin && order.userId._id.toString() !== req.user.id) {
      return next(errorHandler(403, "Not authorized to view this order"));
    }
    console.log(order);
    res.json(order);
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export const generateInvoice = async (req, res, next) => {
  try {
    const { orderNumber } = req.params;

   
    const order = await Order.findById(orderNumber)
      .populate("userId")
      .populate("addressId");
    if (!order) return res.status(404).json({ message: "Order not found" });
    console.log(order);

    // Creating a new PDF document
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([600, 800]);

    // basic document styling
    page.drawText(`Invoice #${order.orderNumber}`, {
      x: 50,
      y: 750,
      size: 20,
      color: rgb(0, 0.53, 0.71),
    });
    page.drawText(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, {
      x: 50,
      y: 720,
      size: 12,
    });

    page.drawText(`Bill To: ${order.userId.username}`, {
      x: 50,
      y: 690,
      size: 12,
    });
    page.drawText(
      `Address: ${order.addressId.address}, ${order.addressId.city}, ${order.addressId.state}, ${order.addressId.pinCode}, ${order.addressId.phone}`,
      {
        x: 50,
        y: 670,
        size: 12,
      }
    );

    // Render each cart item in the order
    let yOffset = 630;
    order.cartItems.forEach((item) => {
      page.drawText(`${item.book} x${item.quantity}`, {
        x: 50,
        y: yOffset,
        size: 12,
      });
      page.drawText(`Price: INR ${item.price}`, {
        x: 400,
        y: yOffset,
        size: 12,
      });
      yOffset -= 20;
    });

    // Add the total amount at the end
    page.drawText(`Subtotal: INR ${order.orderSummary.subtotal}`, {
      x: 50,
      y: yOffset - 20,
      size: 12,
    });
    page.drawText(`Discount: INR ${order.orderSummary.totalDiscount || 0}`, {
      x: 50,
      y: yOffset - 40,
      size: 12,
    });
    page.drawText(`Total: INR ${order.orderSummary.total}`, {
      x: 50,
      y: yOffset - 60,
      size: 14,
      color: rgb(0.95, 0.1, 0.1),
    });

    // Serialize PDF to a Buffer and send it as a response
    const pdfBytes = await pdfDoc.save();
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="invoice_${order.orderNumber}.pdf"`
    );
    res.send(Buffer.from(pdfBytes, "binary"));
  } catch (error) {
    console.error(error);
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

// Apply Coupon
export const applyCoupon = async (req, res, next) => {
  try {
    const { couponCode, totalAmount } = req.body;
    console.log(req.body);

    if (!couponCode || !totalAmount) {
      return next(errorHandler(400, "All fields are required"));
    }

    const coupon = await Coupon.findOne({ code: couponCode });

    if (!coupon) {
      return next(errorHandler(404, "Coupon not found"));
    }

    if (!coupon.isActive) {
      return next(errorHandler(404, "Coupon is inactive"));
    }

    if (new Date() > coupon.expiryDate) {
      return next(errorHandler(404, "Coupon has expired"));
    }

    if (coupon.usageCount >= coupon.maxUsage) {
      return next(errorHandler(404, "Coupon usage limit reached"));
    }

    const discountAmount = (totalAmount * coupon.discount) / 100;
    // const updatedCoupon = await Coupon.findByIdAndUpdate(
    //   coupon._id,
    //   { $inc: { usageCount: 1 } },
    //   { new: true }
    // );

    res.status(200).json({
      message: "Coupon applied successfully",
      discountAmount,
      coupon: coupon._id,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export const cancelOrder = async (req, res, next) => {
  try {
    const { orderId, itemId } = req.params;
    const { cancelReason } = req.body;

    // Find the order
    const order = await Order.findById(orderId);
    if (!order) {
      return next(errorHandler(404, "Order not found"));
    }

    // Find the specific item in the order
    const item = order.cartItems.find((item) => item._id.toString() === itemId);
    if (!item) {
      return next(errorHandler(404, "Item not found in the order"));
    }

    // Check if the item is already cancelled
    if (item.status === "cancelled") {
      return next(errorHandler(400, "This item is already cancelled"));
    }

    // Update the item status to cancelled
    item.status = "cancelled";
    item.cancelReason = cancelReason;

    // Update the book stock
    await Book.findByIdAndUpdate(
      item.bookId,
      { $inc: { stock: item.quantity } },
      { new: true }
    );

    // Calculate refund amount
    const refundAmount = item.price * item.quantity;

    // Process refund to wallet
    let wallet = await Wallet.findOne({ userId: order.userId });
    if (!wallet) {
      wallet = new Wallet({ userId: order.userId });
    }

    wallet.balance += refundAmount;
    wallet.transactions.push({
      amount: refundAmount,
      type: "credit",
      description: `Refund for cancelled item in order ${order.orderNumber}`,
    });

    await wallet.save();

    // Update order item with refund information
    item.refundStatus = "processed";
    item.refundAmount = refundAmount;

    // If it was a Razorpay payment, we might want to record the original payment ID
    if (
      order.paymentMethod === "Razorpay" &&
      order.paymentStatus === "success"
    ) {
      item.originalPaymentId = order.razorpayPaymentId;
    }

    // Save the updated order
    await order.save();

    res.json({
      message: "Order item cancelled successfully",
      refundStatus: item.refundStatus,
      refundAmount: refundAmount,
      walletBalance: wallet.balance,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

export const returnOrder = async (req, res) => {
  try {
    const { orderId, itemId } = req.body;
    const { returnReason } = req.body;

    // Find the order and the specific item
    const order = await Order.findById(orderId);
    const item = order.cartItems.find((item) => item._id.toString() === itemId);

    if (!order || !item) {
      return res.status(404).json({ message: "Order or item not found" });
    }

    if (item.status !== "delivered") {
      return res
        .status(400)
        .json({ message: "Item is not eligible for return" });
    }

    // Update the order item status to 'returned'
    item.status = "returned";
    item.returnReason = returnReason;
    item.returnDate = new Date();

    // Update the book stock
    await Book.findByIdAndUpdate(item.bookId, {
      $inc: { stock: item.quantity },
    });

    // Calculate refund amount (you might want to adjust this based on your refund policy)
    const refundAmount = item.price * item.quantity;

    // Process refund to wallet
    let wallet = await Wallet.findOne({ userId: order.userId });
    if (!wallet) {
      wallet = new Wallet({ userId: order.userId, balance: 0 });
    }

    wallet.balance += refundAmount;
    wallet.transactions.push({
      amount: refundAmount,
      type: "credit",
      description: `Refund for returned item in order ${order.orderNumber}`,
    });

    await wallet.save();

    // Save the updated order
    await order.save();

    res.json({
      message: "Order item returned successfully",
      refundAmount,
      newWalletBalance: wallet.balance,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to process return" });
  }
};

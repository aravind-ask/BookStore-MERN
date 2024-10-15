import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    userid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    user: {
      type: String,
    },
    cartItems: [
      {
        bookId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Book",
        },
        book: {
          type: String,
        },
        images: {
          type: [String],
        },
        price: {
          type: Number,
        },
        discount: {
          type: Number,
        },
        quantity: {
          type: Number,
        },
        status: {
          type: String,
          enum: ["pending", "shipped", "delivered", "cancelled"],
          default: "pending",
        },
      },
    ],
    addressId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Address",
    },
    paymentMethord: {
      type: String,
    },
    razorpayPaymentId: {
      type: String,
    },
    orderDate: {
      type: Date,
    },
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);

export default Order;

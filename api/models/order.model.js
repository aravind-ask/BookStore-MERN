import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
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
    paymentMethod: {
      type: String,
    },
    razorpayPaymentId: {
      type: String,
    },
    orderDate: {
      type: Date,
    },
    orderSummary: {
      type: Object,
    },
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);

export default Order;

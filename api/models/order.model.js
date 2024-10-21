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
        cancelReason: {
          type: String,
        },
        refundStatus: {
          type: String,
          enum: ["pending", "processed"],
          default: "pending",
        },
        refundAmount: {
          type: Number,
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
    razorpayOrderId: {
      type: String,
    },
    razorpayPaymentId: {
      type: String,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "success", "failed"],
      default: "pending",
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

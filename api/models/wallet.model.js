// models/wallet.model.js
import mongoose from "mongoose";

const WalletSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  balance: {
    type: Number,
    default: 0,
  },
  transactions: [
    {
      amount: Number,
      type: {
        type: String,
        enum: ["credit", "debit"],
      },
      description: String,
      date: {
        type: Date,
        default: Date.now,
      },
    },
  ],
});

export default mongoose.model("Wallet", WalletSchema);

import mongoose from "mongoose";

const offerSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    type: {
      type: String,
      enum: ["product", "category", "referral"],
      required: true,
    },
    discountPercentage: { type: Number, required: true },
    applicableProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Book" }], // For product offers
    applicableCategory: { type: mongoose.Schema.Types.ObjectId, ref: "Category" }, // For category offers
    referralCode: { type: String }, // For referral offers
    isActive: { type: Boolean, default: true },
    expiryDate: { type: Date, required: true },
  },
  { timestamps: true }
);

const Offer = mongoose.model("Offer", offerSchema);
export default Offer;

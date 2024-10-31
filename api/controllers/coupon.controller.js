import Coupon from "../models/coupon.model.js";
import { errorHandler } from "../utils/error.js";

// Create Coupon
export const createCoupon = async (req, res, next) => {
  try {
    const { code, discount, maxUsage, expiryDate, minPurchaseAmt } = req.body;

    if (!code || !discount || !maxUsage || !expiryDate || !minPurchaseAmt) {
      return next(errorHandler(400, "All fields are required"));
    }

    const existingCoupon = await Coupon.findOne({ code });
    if (existingCoupon) {
      return next(errorHandler(409, "Coupon code already exists"));
    }

    const coupon = new Coupon({
      code,
      discount,
      maxUsage,
      expiryDate,
      isActive: true,
      minPurchaseAmt,
    });

    await coupon.save();
    res.status(201).json({ message: "Coupon created successfully", coupon });
  } catch (error) {
    next(error);
  }
};

// Edit Coupon
export const editCoupon = async (req, res, next) => {
  try {
    const { couponId } = req.params;
    const { code, discount, maxUsage, expiryDate, isActive, minPurchaseAmt } =
      req.body;

    const coupon = await Coupon.findById(couponId);
    if (!coupon) {
      return next(errorHandler(404, "Coupon not found"));
    }

    if (code && code !== coupon.code) {
      const existingCoupon = await Coupon.findOne({ code });
      if (existingCoupon) {
        return next(errorHandler(409, "Coupon code already exists"));
      }
    }

    const updatedCoupon = await Coupon.findByIdAndUpdate(
      couponId,
      { code, discount, maxUsage, expiryDate, isActive, minPurchaseAmt },
      { new: true, runValidators: true }
    );

    res
      .status(200)
      .json({ message: "Coupon updated successfully", updatedCoupon });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export const updateCouponStatus = async (req, res, next) => {
  try {
    const couponId = req.params.couponId;
    const { isActive } = req.body;
    const coupon = await Coupon.findById(couponId);
    if (!coupon) {
      return next(errorHandler(404, "Coupon not found"));
    }
    coupon.isActive = isActive;
    await coupon.save();
    res.status(200).json({ message: "Coupon status updated successfully" });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

// Delete Coupon
export const deleteCoupon = async (req, res, next) => {
  try {
    const { couponId } = req.params;
    const deletedCoupon = await Coupon.findByIdAndDelete(couponId);

    if (!deletedCoupon) {
      return next(errorHandler(404, "Coupon not found"));
    }

    res.status(200).json({ message: "Coupon deleted successfully" });
  } catch (error) {
    next(error);
  }
};

// Get all coupons
export const getAllCoupons = async (req, res, next) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.status(200).json(coupons);
  } catch (error) {
    next(error);
  }
};

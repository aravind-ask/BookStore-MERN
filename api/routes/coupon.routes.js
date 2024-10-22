import express from "express";
import { verifyToken } from "../utils/verifyUser.js";
import {
  createCoupon,
  deleteCoupon,
  editCoupon,
  getAllCoupons,
  updateCouponStatus,
} from "../controllers/coupon.controller.js";

const router = express.Router();

router.post("/", verifyToken, createCoupon);
router.post("/edit/:couponId", verifyToken, editCoupon);
router.get("/", verifyToken, getAllCoupons);
router.delete("/:couponId", verifyToken, deleteCoupon);
router.put("/:couponId", verifyToken, updateCouponStatus);

export default router;

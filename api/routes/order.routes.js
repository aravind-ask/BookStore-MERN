import express from "express";
import { verifyToken } from "../utils/verifyUser.js";
import {
  applyCoupon,
  cancelOrder,
  getOrderDetails,
  getOrders,
  placeOrder,
  returnOrder,
  updateOrderItemStatus,
  verifyPayment,
} from "../controllers/order.controller.js";

const router = express.Router();

router.post("/checkout", verifyToken, placeOrder);
router.post("/verify-payment", verifyToken, verifyPayment);
router.get("/", verifyToken, getOrders);
router.get("/:orderId", verifyToken, getOrderDetails);
router.patch("/update/:orderId/:itemId", verifyToken, updateOrderItemStatus);
router.post("/cancel/:orderId/:itemId", verifyToken, cancelOrder);
router.post("/return", verifyToken, returnOrder)
router.post("/apply-coupon", verifyToken, applyCoupon)

export default router;

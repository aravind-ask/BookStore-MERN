import express from "express";
import { verifyToken } from "../utils/verifyUser.js";
import { getOrders, placeOrder, updateOrderItemStatus, verifyPayment } from "../controllers/order.controller.js";

const router = express.Router();

router.post("/checkout", verifyToken, placeOrder);
router.post("/verify-payment", verifyToken, verifyPayment);
router.get("/:userId", verifyToken, getOrders);
router.patch("/update/:orderId/:itemId", verifyToken, updateOrderItemStatus);

export default router;

import express from "express";
import { verifyToken } from "../utils/verifyUser.js";
import { placeOrder } from "../controllers/order.controller.js";

const router = express.Router();

router.post("/checkout", verifyToken, placeOrder);

export default router;

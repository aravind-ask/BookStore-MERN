import express from "express";
import { verifyToken } from "../utils/verifyUser.js";
import { addToCart, getCart, removeCart, updateQuantity } from "../controllers/cart.controller.js";
const router = express.Router();

router.post("/add", verifyToken, addToCart);
router.get("/:userId", verifyToken, getCart);
router.put("/update", verifyToken, updateQuantity);
router.delete("/remove/:userId/:bookId", verifyToken, removeCart);

export default router;

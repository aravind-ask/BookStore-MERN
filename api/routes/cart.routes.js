import express from "express";
import { verifyToken } from "../utils/verifyUser.js";
import {
  addToCart,
  clearCartItems,
  getCart,
  removeCart,
  updateQuantity,
} from "../controllers/cart.controller.js";
const router = express.Router();

router.post("/add", verifyToken, addToCart);
router.get("/:userId", verifyToken, getCart);
router.put("/update", verifyToken, updateQuantity);
router.delete("/remove/:userId/:bookId", verifyToken, removeCart);
router.delete("/clear/:userId", verifyToken, clearCartItems);

export default router;

import express from "express";
import { verifyToken } from "../utils/verifyUser.js";
import { addToWishlist, checkIfInWishlist, getWishlist, removeFromWishlist } from "../controllers/wishlist.controller.js";
const router = express.Router();

router.post("/add-to-wishlist", verifyToken, addToWishlist);
router.get("/get-wishlist/:userId", verifyToken, getWishlist);
router.get("/check", verifyToken, checkIfInWishlist);
router.delete("/remove", verifyToken, removeFromWishlist);

export default router;

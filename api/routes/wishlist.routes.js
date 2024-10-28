import express from "express";
import { verifyToken } from "../utils/verifyUser.js";
import { addToWishlist, getWishlist } from "../controllers/wishlist.controller.js";
const router = express.Router();

router.post("/add-to-wishlist", verifyToken, addToWishlist);
router.get("/get-wishlist/:userId", verifyToken, getWishlist);
router.delete("/remove", verifyToken, getWishlist);

export default router;

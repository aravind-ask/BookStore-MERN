import express from "express";
import { createRating, deleteRating, editRating, getAllRating, getRatings, likeRating } from "../controllers/rating.controller.js";
import { verifyToken } from "../utils/verifyUser.js";

const router = express.Router();

router.post("/create", verifyToken, createRating);
router.get("/getBookRatings/:bookId", getRatings);
router.put("/likeRating/:ratingId", verifyToken, likeRating);
router.put("/editRating/:ratingId", verifyToken, editRating);
router.delete("/deleteRating/:ratingId", verifyToken, deleteRating);
router.get("/getAllRatings", verifyToken, getAllRating);


export default router;

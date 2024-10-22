import express from "express";
import { verifyToken } from "../utils/verifyUser.js";
import {
  createOffer,
  deleteOffer,
  getOffers,
  updateOffer,
} from "../controllers/offer.controller.js";

const router = express.Router();

router.post("/", verifyToken, createOffer);
router.get("/", verifyToken, getOffers);
router.delete("/:offerId", verifyToken, deleteOffer);
router.patch("/:offerId", verifyToken, updateOffer);

export default router;

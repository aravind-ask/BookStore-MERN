import express from "express";
import {
  getBestSellers,
  getSalesReport,
} from "../controllers/sales.controller.js";
const router = express.Router();

// Route to generate sales report
router.get("/report", getSalesReport);
router.get("/best-sellers", getBestSellers);

export default router;

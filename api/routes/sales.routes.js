import express from "express";
import { getSalesReport } from "../controllers/sales.controller.js";
const router = express.Router();

// Route to generate sales report
router.get("/report", getSalesReport);

export default router
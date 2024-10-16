import express from "express";
import { signin, signup, google, verifyOtp } from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/verify-otp", verifyOtp);
router.post("/signin", signin);
router.post("/google", google);

export default router;

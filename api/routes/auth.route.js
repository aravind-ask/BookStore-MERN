import express from "express";
import { signin, signup, google, verifyOtp, resendOtp, forgotPassword, resetPassword, adminSignin } from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/signin", signin);
router.post("/admin/signin", adminSignin);
router.post("/verify-otp", verifyOtp);
router.post("/resend-otp", resendOtp);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/google", google);

export default router;

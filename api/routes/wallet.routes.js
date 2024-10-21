import express from "express";
import { verifyToken } from "../utils/verifyUser.js";
import { getWallet } from "../controllers/wallet.controller.js";

const router = express.Router();

router.get("/", verifyToken, getWallet);

export default router;

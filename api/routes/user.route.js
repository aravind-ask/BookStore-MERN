import express from "express";
import { blockUser, deleteUser, getUser, getUsers, signout, test, unblockUser, updateUser } from "../controllers/user.controller.js";
import { verifyToken } from "../utils/verifyUser.js";
const router = express.Router();

router.get("/test", test);
router.post("/signout", signout);
router.put("/update/:userId",verifyToken, updateUser);
router.delete("/delete/:userId",verifyToken, deleteUser);
router.patch("/block/:userId",verifyToken, blockUser);
router.patch("/unblock/:userId",verifyToken, unblockUser);
router.get("/getusers",verifyToken, getUsers);
router.get("/:userId", getUser);

export default router;

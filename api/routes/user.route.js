import express from "express";
import { deleteUser, getUsers, signout, test, updateUser } from "../controllers/user.controller.js";
import { verifyToken } from "../utils/verifyUser.js";
const router = express.Router();

router.get("/test", test);
router.post("/signout", signout);
router.put("/update/:userId",verifyToken, updateUser);
router.delete("/delete/:userId",verifyToken, deleteUser);
router.get("/getusers",verifyToken, getUsers);

export default router;

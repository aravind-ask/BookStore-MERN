import express from "express";
import {
  addCategory,
  editCategory,
  deleteCategory,
  getCategories,
  getCategory
} from "../controllers/category.controller.js";
import { verifyToken } from "../utils/verifyUser.js";

const router = express.Router();

router.post("/add-category", verifyToken, addCategory);
router.put("/edit-category/:categoryId", verifyToken, editCategory);
router.delete("/delete-category/:categoryId", verifyToken, deleteCategory);
router.get("/get-categories", getCategories);
router.get("/get-category/:categoryId", getCategory);

export default router;

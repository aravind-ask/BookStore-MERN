// routes/books.route.js
import express from "express";
import multer from "multer";
import {
  addBook,
  deleteBook,
  getBooks,
  getCategoryWiseBooks,
  listBook,
  unlistBook,
  updateBook,
} from "../controllers/book.controller.js";
import { verifyToken } from "../utils/verifyUser.js";

const router = express.Router();
const upload = multer({ dest: "./uploads/" });

router.post(
  "/add-book",
  upload.fields([
    { name: "image1", maxCount: 1 },
    { name: "image2", maxCount: 1 },
    { name: "image3", maxCount: 1 },
    { name: "image4", maxCount: 1 },
  ]),
  verifyToken,
  addBook
);
router.get("/getbooks", getBooks);
router.get("/getcategorywisebooks", getCategoryWiseBooks);
router.delete("/deletebook/:bookId/:userId", verifyToken, deleteBook);
router.put("/update-book/:bookId/:userId", verifyToken, updateBook);
router.patch("/listbook/:bookId/:userId", verifyToken, listBook);
router.patch("/unlistbook/:bookId/:userId", verifyToken, unlistBook);

export default router;

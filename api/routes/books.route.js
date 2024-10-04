// routes/books.route.js
import express from "express";
import { addBook } from "../controllers/book.controller";

const router = express.Router();

router.post("/add-book", addBook);

export default router;

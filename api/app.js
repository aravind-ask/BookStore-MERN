import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import authRoutes from "./routes/auth.route.js";
import userRoutes from "./routes/user.route.js";
import bookRoutes from "./routes/books.route.js";
import ratingRoutes from "./routes/rating.route.js";
import categoryRoutes from "./routes/category.routes.js";
import wishlistRoutes from "./routes/wishlist.routes.js";
import addressRoutes from "./routes/address.routes.js";
import cartRoutes from "./routes/cart.routes.js";
import orderRoutes from "./routes/order.routes.js";
import walletRoutes from "./routes/wallet.routes.js";
import couponRoutes from "./routes/coupon.routes.js";
import offerRoutes from "./routes/offer.routes.js";
import salesRoutes from "./routes/sales.routes.js";
import cookieParser from "cookie-parser";
import path from "path";

dotenv.config();

const app = express();

//middlewares
app.use(express.json()); //Parse JSON payloads in incoming requests
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173",
  })
); //Enable CORS support for cross-origin requests
app.use(morgan("dev")); //Log requests and responses to the console in a development-friendly format

//Database Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Database Connected"))
  .catch((err) => console.error(err));

//Routes
app.use("/api/user", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/rating", ratingRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/address", addressRoutes);
app.use("/api/order", orderRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/coupon", couponRoutes);
app.use("/api/offer", offerRoutes);
app.use("/api/sales", salesRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

const __dirname = path.resolve();

app.use(express.static(path.join(__dirname, "/client/dist")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "client", "dist", "index.html"));
});

// Middleware for error messages
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  return res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
});

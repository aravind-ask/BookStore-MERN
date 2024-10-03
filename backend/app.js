import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import mmorgan from "morgan";
import morgan from "morgan";
import authRoutes from './routes/auth.route.js'
import userRoutes from './routes/user.route.js'

dotenv.config();

const app = express();

//middlewares
app.use(express.json()); //Parse JSON payloads in incoming requests
app.use(cors()); //Enable CORS support for cross-origin requests
app.use(morgan("dev")); //Log requests and responses to the console in a development-friendly format

//Database Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Database Connected"))
  .catch((err) => console.error(err));


//Routes
app.use('/api/user',userRoutes)
app.use('/api/auth',authRoutes)


const PORT = process.env.PORT || 5000;
app.listen(PORT,()=>{
    console.log(`Server is running on http://localhost:${PORT}`)
})


// Middleware for error messages
app.use((err, req, res, next)=>{
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  return res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
})
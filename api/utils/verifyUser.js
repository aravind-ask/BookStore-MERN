import jwt from "jsonwebtoken";
import { errorHandler } from "./error.js";
export const verifyToken = (req, res, next) => {
  const token = req.cookies.access_token;
  if (!token) {
    return next(errorHandler(401, "Unauthorized"));
  }
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return next(errorHandler(401, "Unauthorized"));
    }
    req.user = user;
    // if (req.user.role !== "admin" && req.path.startsWith("/admin")) {
    //   // return res.status(403).json({ msg: "Access denied" });
    //   return next(errorHandler(403, "Access denied"));
    // }
    next();
  });
};

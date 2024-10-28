import User from "../models/user.model.js";

export const checkIfBlocked = (req, res, next) => {
  const userId = req.user.id;
  const user = User.findById(userId);
  console.log(user);
  if (user.isBlocked) {
    try {
      res
        .clearCookie("access_token")
        .status(403)
        .json("You have been blocked by the Admin");
    } catch (error) {
      next(error);
    }
  }
  next();
};

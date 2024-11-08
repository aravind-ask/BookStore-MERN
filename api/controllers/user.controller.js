import bcryptjs from "bcryptjs";
import { errorHandler } from "../utils/error.js";
import User from "../models/user.model.js";
import { Server } from "socket.io";
const socket = new Server();

export const test = (req, res) => {
  res.json({ message: "API is working!" });
};

export const signout = (req, res, next) => {
  try {
    res
      .clearCookie("access_token")
      .status(200)
      .json("User has been signed out");
  } catch (error) {
    next(error);
  }
};

export const verifyUser = async (req, res, next) => {
  try {
    // Assuming user ID is stored in req.user after authentication middleware
    const userId = req.user.id;

    // Fetch user from the database
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.isBlocked) {
      return res.status(403).json({ message: "User is blocked" });
    }

    // Return the isBlocked status and other essential user data
    res.status(200).json({
      isBlocked: user.isBlocked,
      isAdmin: user.isAdmin,
      name: user.name,
      email: user.email,
      // Add any other fields as necessary
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  if (req.user.id !== req.params.userId) {
    return next(errorHandler(403, "You are not allowed to update this user"));
  }
  if (req.body.password) {
    if (req.body.password.length < 6) {
      return next(errorHandler(400, "Password must be at least 6 characters"));
    }
    req.body.password = bcryptjs.hashSync(req.body.password, 10);
  }
  if (req.body.username) {
    if (req.body.username.length < 7 || req.body.username.length > 20) {
      return next(
        errorHandler(400, "Username must be between 7 and 20 characters")
      );
    }
    if (req.body.username.includes(" ")) {
      return next(errorHandler(400, "Username cannot contain spaces"));
    }
    if (req.body.username !== req.body.username.toLowerCase()) {
      return next(errorHandler(400, "Username must be lowercase"));
    }
    if (!req.body.username.match(/^[a-zA-Z0-9]+$/)) {
      return next(
        errorHandler(400, "Username can only contain letters and numbers")
      );
    }
  }
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.userId,
      {
        $set: {
          username: req.body.username,
          email: req.body.email,
          profilePicture: req.body.profilePicture,
          password: req.body.password,
        },
      },
      { new: true }
    );
    const { password, ...rest } = updatedUser._doc;
    res.status(200).json(rest);
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  if (!req.user.isAdmin && req.user.id !== req.params.userId) {
    return next(errorHandler(403, "You are not allowed to delete this user"));
  }
  try {
    await User.findByIdAndDelete(req.params.userId);
    res.status(200).json("User has been deleted");
  } catch (error) {
    next(error);
  }
};

export const blockUser = async (req, res, next) => {
  if (!req.user.isAdmin) {
    return next(errorHandler(403, "You are not allowed to block this user"));
  }
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return next(errorHandler(404, "User  not found"));
    }
    user.isBlocked = true;
    await user.save();
    socket.emit("blocked", user._id);

    res.status(200).json(`User  has been blocked`);
  } catch (error) {
    next(error);
  }
};

export const unblockUser = async (req, res, next) => {
  if (!req.user.isAdmin) {
    return next(errorHandler(403, "You are not allowed to unblock this user"));
  }
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return next(errorHandler(404, "User  not found"));
    }
    user.isBlocked = false;
    await user.save();
    res.status(200).json(`User  has been unblocked`);
  } catch (error) {
    next(error);
  }
};

export const getUsers = async (req, res, next) => {
  if (!req.user.isAdmin) {
    return next(errorHandler(403, "You are not allowed to see all users"));
  }

  try {
    const startIndex = parseInt(req.query.startIndex) || 0;
    const limit = parseInt(req.query.limit) || 9;
    const sortDirection = req.query.sort === "asc" ? 1 : -1;

    // Fetch users with pagination and sorting
    const users = await User.find()
      .sort({ createdAt: sortDirection }) // Sort by createdAt
      .skip(startIndex)
      .limit(limit);

    // Remove password field from response
    const usersWithoutPassword = users.map((user) => {
      const { password, ...rest } = user._doc;
      return rest;
    });

    // Total number of users (for pagination)
    const totalUsers = await User.countDocuments();

    // Calculate total pages
    const totalPages = Math.ceil(totalUsers / limit);

    // Count users created in the last month
    const now = new Date();
    const oneMonthAgo = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      now.getDate()
    );
    const lastMonthUsers = await User.countDocuments({
      createdAt: { $gte: oneMonthAgo },
    });

    // Send the response with pagination metadata
    res.status(200).json({
      users: usersWithoutPassword,
      totalUsers,
      totalPages, // Add totalPages to support pagination on the frontend
      lastMonthUsers,
    });
  } catch (error) {
    // Improved error handling with more context
    next(errorHandler(500, `Error fetching users: ${error.message}`));
  }
};

export const getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return next(errorHandler(404, "User not found"));
    }
    const { password, ...rest } = user._doc;
    res.status(200).json(rest);
  } catch (error) {
    next(error);
  }
};

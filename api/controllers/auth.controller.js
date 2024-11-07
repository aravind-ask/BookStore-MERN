import User from "../models/user.model.js";
import bcryptjs from "bcryptjs";
import { errorHandler } from "../utils/error.js";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

const sendOtp = async (email, otp) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: "rebook.auth.369@gmail.com",
        pass: "lfpy hlrj fyrc cyjd",
      },
    });

    const mailOptions = {
      from: "rebook.auth.369@gmail.com",
      to: email,
      subject: "OTP Verification",
      text: `Your OTP is: ${otp}`,
    };

    const info = await transporter.sendMail(mailOptions);
    return { info, message: "success" };
  } catch (error) {
    return Promise.reject(error);
  }
};

export const signup = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    if (
      !username ||
      !email ||
      !password ||
      username === "" ||
      email === "" ||
      password === ""
    ) {
      next(errorHandler(400, "All fields are required"));
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      next(errorHandler(400, "User already exists"));
    }

    const hashedPassword = await bcryptjs.hashSync(password, 10);
    const otp = Math.floor(100000 + Math.random() * 900000);
    const otpExpiration = new Date(Date.now() + 5 * 60 * 1000);
    const send = await sendOtp(email, otp);
    if (send.message !== "success") {
      return next(errorHandler(400, "Error Sending OTP"));
    }

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      otp,
      otpExpiration,
    });
    await newUser.save();
    res.json("Otp send, Please verify");
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return next(errorHandler(404, "User not found"));
    }
    if (user.otpExpiration < new Date()) {
      return next(errorHandler(400, "OTP has expired"));
    }
    if (user.otp !== otp) {
      return next(errorHandler(400, "Invalid OTP"));
    }
    user.otp = null;
    user.otpExpiration = null;
    user.isVerified = true;
    await user.save();
    const token = jwt.sign(
      { id: user._id, isAdmin: user.isAdmin },
      process.env.JWT_SECRET
    );
    const { password: pass, ...rest } = user._doc;
    res
      .status(200)
      .cookie("access_token", token, {
        httpOnly: true,
      })
      .json(rest);
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export const resendOtp = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return next(errorHandler(404, "User not found"));
    }
    const otp = Math.floor(100000 + Math.random() * 900000);
    const send = await sendOtp(email, otp);
    if (send.message !== "success") {
      return next(errorHandler(400, "Error Sending OTP"));
    }
    user.otp = otp;
    user.otpExpiration = new Date(Date.now() + 5 * 60 * 1000);
    await user.save();
    res.json({ success: true, message: "OTP resent successfully" });
  } catch (error) {
    next(error);
  }
};


export const signin = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password || email === "" || password === "") {
    next(errorHandler(400, "All fields are required"));
  }

  try {
    const validUser = await User.findOne({ email });
    if (!validUser) {
      return next(errorHandler(404, "User  not found"));
    }

    if (validUser.isAdmin) {
      return next(
        errorHandler(403, "Admins must log in through admin sign in")
      );
    }

    if (validUser.isBlocked) {
      return res.status(403).json({
        success: false,
        message: "Your account is blocked by the admin",
      });
    }

    if (!validUser.isVerified) {
      const otp = Math.floor(100000 + Math.random() * 900000);
      await sendOtp(email, otp);
      validUser.otp = otp;
      await validUser.save()
      return res
        .status(401)
        .json({ success: false, message: "Please verify your account first" });
    }

    const validPassword = bcryptjs.compareSync(password, validUser.password);
    if (!validPassword) {
      return next(errorHandler(400, "Invalid password"));
    }

    const token = jwt.sign(
      { id: validUser._id, isAdmin: validUser.isAdmin },
      process.env.JWT_SECRET
    );

    const { password: pass, ...rest } = validUser._doc;

    res
      .status(200)
      .cookie("access_token", token, {
        httpOnly: true,
      })
      .json(rest);
  } catch (error) {
    next(error);
  }
};

// auth.controller.js

export const adminSignin = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password || email === "" || password === "") {
    next(errorHandler(400, "All fields are required"));
  }

  try {
    const validUser = await User.findOne({ email });
    if (!validUser) {
      return next(errorHandler(404, "User not found"));
    }

    if (!validUser.isAdmin) {
      return next(errorHandler(403, "Not authorized as admin"));
    }

    if (validUser.isBlocked) {
      return res.status(403).json({
        success: false,
        message: "Your account is blocked",
      });
    }

    const validPassword = bcryptjs.compareSync(password, validUser.password);
    if (!validPassword) {
      return next(errorHandler(400, "Invalid password"));
    }

    const token = jwt.sign(
      { id: validUser._id, isAdmin: validUser.isAdmin },
      process.env.JWT_SECRET
    );

    const { password: pass, ...rest } = validUser._doc;

    res
      .status(200)
      .cookie("access_token", token, {
        httpOnly: true,
      })
      .json(rest);
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req, res, next) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return next(errorHandler(404, "User not found"));
    }
    const otp = Math.floor(100000 + Math.random() * 900000);
    const send = await sendOtp(email, otp);
    if (send.message !== "success") {
      return next(errorHandler(400, "Error Sending OTP"));
    }
    user.otp = otp;
    user.otpExpiration = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
    await user.save();
    res.json({ success: true, message: "OTP sent successfully" });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  const { email, otp, newPassword } = req.body;
  try {
    const user = await User.findOne({
      email,
      otp,
      otpExpiration: { $gt: Date.now() },
    });
    if (!user) {
      return next(errorHandler(400, "Invalid or expired OTP"));
    }
    const hashedPassword = bcryptjs.hashSync(newPassword, 10);
    user.password = hashedPassword;
    user.otp = null;
    user.otpExpiration = null;
    await user.save();
    res.json({ success: true, message: "Password reset successfully" });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export const google = async (req, res, next) => {
  const { email, name, googlePhotoUrl } = req.body;
  try {
    const user = await User.findOne({ email });
    if (user) {
      const token = jwt.sign(
        { id: user._id, isAdmin: user.isAdmin },
        process.env.JWT_SECRET
      );
      const { password, ...rest } = user._doc;
      res
        .status(200)
        .cookie("access_token", token, {
          httpOnly: true,
        })
        .json(rest);
    } else {
      const generatedPassword =
        Math.random().toString(36).slice(-8) +
        Math.random().toString(36).slice(-8);
      const hashedPassword = bcryptjs.hashSync(generatedPassword, 10);
      const newUser = new User({
        username:
          name.toLowerCase().split(" ").join("") +
          Math.random().toString(9).slice(-4),
        email,
        password: hashedPassword,
        profilePicture: googlePhotoUrl,
      });
      await newUser.save();
      const token = jwt.sign(
        { id: newUser._id, isAdmin: newUser.isAdmin },
        process.env.JWT_SECRET
      );
      const { password, ...rest } = newUser._doc;
      res
        .status(200)
        .cookie("access_token", token, {
          httpOnly: true,
        })
        .json(rest);
    }
  } catch (error) {
    next(error);
  }
};

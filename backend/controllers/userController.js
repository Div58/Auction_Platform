import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/error.js";
import User from "../models/userSchema.js";
import { v2 as cloudinary } from "cloudinary";
import { generateToken } from "../utils/jwtToken.js";
// import  stripe  from "../utils/stripe.js";

//import { razorpay } from "../utils/razorpay.js";

export const register = catchAsyncErrors(async (req, res, next) => {
  
    // Check for profile image
    if (!req.files || Object.keys(req.files).length === 0) {
      return next(new ErrorHandler("Profile Image Required.", 400));
    }

    const { profileImage } = req.files;
    const allowedFormats = ["image/png", "image/jpeg", "image/webp"];
    if (!allowedFormats.includes(profileImage.mimetype)) {
      return next(new ErrorHandler("File format not supported.", 400));
    }



    // Destructure form fields
    const {
      userName,
      email,
      password,
      phone,
      address,
      role,
      bankAccountNumber,
      bankAccountName,
      bankName,
    } = req.body ||{};

    if (!userName || !email || !phone || !password || !address || !role) {
      return next(new ErrorHandler("Please fill the full form.", 400));
    }

    if (role === "Auctioneer") {
      if (!bankAccountName || !bankAccountNumber || !bankName) {
        return next(new ErrorHandler("Please provide your full bank details.", 400));
      }
    }

    // Check for existing user
    const isRegistered = await User.findOne({ email });
    if (isRegistered) {
      return next(new ErrorHandler("User already registered.", 400));
    }

    // Upload image to Cloudinary
    const cloudinaryResponse = await cloudinary.uploader.upload(
      profileImage.tempFilePath,
      {
        folder: "MERN_AUCTION_PLATFORM_USERS",
      }
    );

    if (!cloudinaryResponse || cloudinaryResponse.error) {
      console.error("Cloudinary Error:", cloudinaryResponse.error || "Unknown error");
      return next(new ErrorHandler("Failed to upload profile image to Cloudinary.", 500));
    }


    // Create user in DB
    const user = await User.create({
      userName,
      email,
      password,
      phone,
      address,
      role,
      profileImage: {
        public_Id: cloudinaryResponse.public_id,
        url: cloudinaryResponse.secure_url,
      },
      paymentMethods: {
        bankTransfer: {
          bankAccountNumber,
          bankAccountName,
          bankName,
        },
        // stripe: {
        //   customerId: stripeCustomer.id,
        //   cardLast4: "", // Will be stored after first transaction
        // },

      },
    });
    generateToken(user, "User registered successfully.", 201, res);

   
  });
  export const login = catchAsyncErrors(async (req, res, next) => { 
    const { email, password } = req.body || {};

    if (!email || !password) {
      return next(new ErrorHandler("Please fill all fields.", 400));
    }

    // Check for existing user
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return next(new ErrorHandler("Invalid credentials.", 401));
    }

    // Check password
    const isPasswordMatched = await user.comparePassword(password);
    if (!isPasswordMatched) { 
      return next(new ErrorHandler("Invalid credentials.", 401));
    }

    generateToken(user, "User logged in successfully.", 200, res);
  });
  export const getProfile = catchAsyncErrors(async (req, res, next) => {
    const user = req.user;
    res.status(200).json({
      success: true,
      user,
    });
  });
  export const logout = catchAsyncErrors(async (req, res, next) => {
    res.status(200).cookie("token", null, {
      expires: new Date(Date.now()),
      httpOnly: true,
    }).json({
      success: true,
      message: "Logged out successfully.",
    });
  });
  export const fetchLeaderboard = catchAsyncErrors(async (req, res, next) => {
    const users = await User.find({moneySpent: {$gt: 0}})
    const leaderboard = users.sort((a, b) => b.moneySpent - a.moneySpent);
    res.status(200).json({
      success: true,
      leaderboard,
    });
  });
import ErrorHandler from "../middlewares/error.js";
import User from "../models/userSchema.js";
import { v2 as cloudinary } from "cloudinary";
import  stripe  from "../utils/stripe.js";
//import { razorpay } from "../utils/razorpay.js";

export const register = async (req, res, next) => {
  try {
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
    } = req.body;

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
      return next(new ErrorHandler("Failed to upload profile image to Cloudinary.", 500));
    }

    // Create Stripe customer
    let stripeCustomer;
    try {
      stripeCustomer = await stripe.customers.create({
        email,
        name: userName,
        phone,
      });
    } catch (err) {
      console.error("Stripe Error:", err);
      return next(new ErrorHandler("Stripe customer creation failed.", 500));
    }

    // Create Razorpay customer
    

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
        stripe: {
          customerId: stripeCustomer.id,
          cardLast4: "", // Will be stored after first transaction
        },
        
      },
    });

    res.status(201).json({
      success: true,
      message: "User registered successfully.",
    });
  } catch (error) {
    console.error("Registration Error:", error);
    next(new ErrorHandler("Internal Server Error", 500));
  }
};

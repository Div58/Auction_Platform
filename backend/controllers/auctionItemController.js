import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/error.js";
import { Auction } from "../models/auctionSchema.js";
import { v2 as cloudinary } from "cloudinary";
import { User } from "../models/userSchema.js";


export const addNewAuctionItem = catchAsyncErrors(async (req, res, next) => {
    if (!req.files || Object.keys(req.files).length === 0) {
        return next(new ErrorHandler("Auction Item Image Required.", 400));
    }

    const { image } = req.files;
    const allowedFormats = ["image/png", "image/jpeg", "image/webp"];
    if (!allowedFormats.includes(image.mimetype)) {
        return next(new ErrorHandler("File format not supported.", 400));
    }
    const {
        title,
        description,
        category,
        condition,
        startingBid,
        startTime,
        endTime } = req.body;
    if (!title || !description || !category || !condition || !startingBid || !startTime || !endTime) {
        return next(new ErrorHandler("Please provide every details.", 400));
    }
    if (new Date(startTime) < Date.now()) {
        return next(new ErrorHandler("Start time must be in the future.", 400));
    }
    if (new Date(endTime) < new Date(startTime)) {
        return next(new ErrorHandler("End time must be after start time.", 400));
    }
    const alreadyOneAuctionActive = await Auction.find({
        createdBy: req.user._id,
        // startTime: { $lte: new Date() },
        endTime: { $gt: Date.now() },
    });
    if (alreadyOneAuctionActive) {
        return next(new ErrorHandler("You already have an active auction.", 400));
    }
    try {
        const cloudinaryResponse = await cloudinary.uploader.upload(
            image.tempFilePath,
            {
                folder: "MERN_AUCTION_PLATFORM_AUCTIONS",
            }
        );

        if (!cloudinaryResponse || cloudinaryResponse.error) {
            console.error("Cloudinary Error:", cloudinaryResponse.error || "Unknown error");
            return next(new ErrorHandler("Failed to upload AUCTION image to Cloudinary.", 500));
        }
        const auctionItem = await Auction.create({
            title,
            description,
            category,
            condition,
            startingBid,
            startTime,
            endTime,
            image: {
                public_id: cloudinaryResponse.public_id,
                url: cloudinaryResponse.secure_url,
            },
            createdBy: req.user._id,
        });
        return res.status(201).json({
            success: true,
            message: `Auction item created successfully and will be listed on Auction Page at ${startTime}`,
            auctionItem,
        });

    }
    catch (error) {
        return next(new ErrorHandler(error.message || "Error while creating auction item.", 500));
    }
});
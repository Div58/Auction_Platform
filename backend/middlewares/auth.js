import {User} from "../models/userSchema.js"
import jwt from "jsonwebtoken"
import ErrorHandler from "./error.js"
import {catchAsyncErrors} from "../middlewares/catchAsyncErrors.js"

export const isAuthenticated = catchAsyncErrors(async (req, res, next) => {
    const token = req.cookies.token
    if (!token) {
        return next(new ErrorHandler("Login first to access this resource", 401))
    }

    const decodedData = jwt.verify(token, process.env.JWT_SECRET_KEY)

    req.user = await User.findById(decodedData.id)

    next()
});
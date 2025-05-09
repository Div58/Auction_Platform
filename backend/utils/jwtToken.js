export const generateToken = (user,message,statusCode,res)=> { 
    const token = user.generateJsonWebToken();
    res
    .status(statusCode)
    .cookie("token", token, {
        expires: new Date(Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
        httpOnly: true,
        // secure: process.env.NODE_ENV === "production" ? true : false,
        // sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    }).json({
        success: true,
        message,
        user,
        token,
    });
}
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnImageKit, deleteOnImageKit } from "../utils/imagekit.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const generateAccessToken = (userId) => {
    return jwt.sign(
        { _id: userId },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
    );
};

const generateRefreshToken = (userId) => {
    return jwt.sign(
        { _id: userId },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
    );
};

const accessTokenOptions = {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    maxAge: 1000 * 60 * 15
};

const refreshTokenOptions = {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    maxAge: 1000 * 60 * 60 * 24 * 15
}

const registerUser = asyncHandler(async (req, res) => {
    const { username, email, password } = req.body;

    // 1. Basic validation
    if (!username || !email || !password) {
        throw new ApiError(400, "All fields are required");
    }

    // 2. Avatar file check
    if (!req.file?.path) {
        throw new ApiError(400, "Avatar is required");
    }

    // 3. Check existing user
    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    });

    if (existedUser) {
        throw new ApiError(409, "User already exists");
    }

    // 4. Upload avatar to ImageKit
    const avatarUpload = await uploadOnImageKit(req.file.path);

    if (!avatarUpload) {
        throw new ApiError(500, "Avatar upload failed");
    }

    // 5. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    let user;
    try {
        // 6. Create user
        user = await User.create({
            username,
            email,
            password: hashedPassword,
            avatar: avatarUpload.url,
            avatarFileId: avatarUpload.fileId
        });
    } catch (error) {
        // rollback avatar if DB fails
        await deleteOnImageKit(avatarUpload.fileId);
        throw error;
    }

    // 7. Remove sensitive fields
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    return res.status(201).json(
        new ApiResponse(201, createdUser, "User registered successfully")
    );
});

const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email  || !password) {
        throw new ApiError(400, "Email or username and password are required");
    }

    // 2. Find user
    const user = await User.findOne({
        $or: [{ email }]
    });

    if (!user) {
        throw new ApiError(404, "User does not exist");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid credentials");
    }

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    const loggedInUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    return res
        .status(200)
        .cookie("accessToken", accessToken, accessTokenOptions)
        .cookie("refreshToken", refreshToken, refreshTokenOptions)
        .json(
            new ApiResponse(
                200,
                { user: loggedInUser },
                "Login successful"
            )
        );
});

const logoutUser = asyncHandler(async (req, res) => {
    // req.user should come from auth middleware
    const userId = req.user?._id;

    if (userId) {
        await User.findByIdAndUpdate(
            userId,
            { $unset: { refreshToken: 1 } },
            { new: true }
        );
    }

    return res
        .status(200)
        .clearCookie("accessToken", accessTokenOptions)
        .clearCookie("refreshToken", refreshTokenOptions)
        .json(new ApiResponse(200, null, "Logged out successfully"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies?.refreshToken;

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Refresh token missing");
    }

    let decoded;
    try {
        decoded = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        );
    } catch (error) {
        throw new ApiError(401, "Invalid or expired refresh token");
    }

    const user = await User.findById(decoded._id);

    if (!user || user.refreshToken !== incomingRefreshToken) {
        throw new ApiError(401, "Refresh token is invalid or reused");
    }

    const newAccessToken = generateAccessToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);

    user.refreshToken = newRefreshToken;
    await user.save({ validateBeforeSave: false });

    return res
        .status(200)
        .cookie("accessToken", newAccessToken, accessTokenOptions)
        .cookie("refreshToken", newRefreshToken, refreshTokenOptions)
        .json(
            new ApiResponse(
                200,
                null,
                "Access token refreshed successfully"
            )
        );
});



export {
    registerUser,
    loginUser,
    refreshAccessToken,
    logoutUser
}
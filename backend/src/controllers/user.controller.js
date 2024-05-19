import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Internal Server Error while generating refresh and access token"
    );
  }
};

const getCurrentlyLoggedInUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user?._id).select(
    "-password -refreshToken"
  );
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, user, "User found successfully"));
});

const register = asyncHandler(async (req, res) => {
  const { username, fullName, email, phone, password } = req.body;
  //console.log("req.body", req.body);
  // validation - check all fields are filled and correctly filled
  if (
    fullName === "" ||
    email === "" ||
    password === "" ||
    username === "" ||
    phone === ""
  ) {
    throw new ApiError(400, "All fields are required");
  }

  if (password.length < 8) {
    throw new ApiError(400, "Password should be atleast 8 chracters long");
  }
  if (email.includes("@") === false) {
    throw new ApiError(400, "Email should be valid");
  }
  if (phone.length < 10) {
    throw new ApiError(400, "Phone Number should be valid!");
  }

  //check if user already exists in the database -using email and username
  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  }); // $or is used to check for multiple conditions
  if (existedUser) {
    throw new ApiError(400, "User with username or email already exists");
  }
  // checking for file
  if (!req.file) {
    throw new ApiError(400, "Profile Picture is required");
  }

  const localProfilePicture = req.file.path;
  if (!localProfilePicture) {
    throw new ApiError(400, "Profile Picture is required");
  }

  const profilePicture = await uploadOnCloudinary(localProfilePicture);

  if (!profilePicture) {
    throw new ApiError(
      500,
      "Something went wrong in uploading image on cloudinary"
    );
  }
  const user = await User.create({
    username,
    fullName,
    email,
    phone,
    password,
    profilePicture: profilePicture.url,
  });

  const createdUser = await User.findById(user._id).select("-password");

  if (!createdUser) {
    throw new ApiError(500, "User not created.Internal Server Error");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, createdUser, "User created successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;
  if (username === "" && email === "") {
    throw new ApiError(400, "Username or Email is required");
  }
  if (password === "") {
    throw new ApiError(400, "Password is required");
  }
  // checking whether any user of username or email exists in the database
  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!existedUser) {
    throw new ApiError(404, "User not found in the database");
  }
  //console.log("existedUser", existedUser);
  // checking whether the entered password is correct or not
  const isPasswordCorrect = await existedUser.isPasswordCorrect(password);
  if (!isPasswordCorrect) {
    throw new ApiError(400, "Password is incorrect");
  }
  // generating access token and refresh Token to store in database as well as provide it to user
  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    existedUser._id
  );
  const loggedInUser = await User.findById(existedUser._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true, //The httpOnly property is set to true, which means that the cookie can only be accessed by the server.
    secure: true, // The secure property is also set to true, which means that the cookie will only be sent over secure (HTTPS) connections.
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { user: loggedInUser, accessToken, refreshToken },
        "User logged in successfully"
      )
    );
});

const logout = asyncHandler(async (req, res) => {
  console.log(req.user);
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: { refreshToken: 1 },
    },
    { new: true }
  );
  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});

const changeFullnamePhoneNumber = asyncHandler(async (req, res) => {
  const { fullName, phone } = req.body;
  if (!fullName && !phone) {
    throw new ApiError(400, "FullName or phone Number is required");
  }
  if (fullName !== "") {
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { fullName },
      { new: true }
    );
    if (!updatedUser) {
      throw new ApiError(
        500,
        "Internal Server error occurred while updating user details "
      );
    }
  }
  if (phone !== "") {
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { phone },
      { new: true }
    );
    if (!updatedUser) {
      throw new ApiError(
        500,
        "Internal Server error occurred while updating user details "
      );
    }
  }

  const user = await User.findById(req.user._id).select(
    "-password -refreshToken"
  );
  return res
    .status(200)
    .json(new ApiResponse(200, user, "User Details Updated successfully"));
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (currentPassword === "" || newPassword === "") {
    throw new ApiError(400, "All fields are required");
  }
  const user = await User.findById(req.user._id);
  if (!(await user.isPasswordCorrect(currentPassword))) {
    throw new ApiError(400, "Current Password is incorrect");
  }
  const userUpdated = await User.findById(req.user._id);
  userUpdated.password = newPassword;
  const newUpdateduser = await userUpdated.save({ validateBeforeSave: false });

  if (!newUpdateduser) {
    throw new ApiError(
      500,
      "Internal Server error occurred while updating password"
    );
  }
  return res
    .status(200)
    .json(
      new ApiResponse(200, newUpdateduser, "Password changed successfully")
    );
});

const changeProfilePicture = asyncHandler(async (req, res) => {
  const profilePicture = req.file?.path;
  if (!profilePicture) {
    throw new ApiError(400, "Profile Picture is required");
  }

  const updatedProfilePicture = await uploadOnCloudinary(profilePicture);
  if (!updatedProfilePicture) {
    throw new ApiError(
      500,
      "Internal Server Error occurred while uploading profile picture on cloudinary"
    );
  }
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        profilePicture: updatedProfilePicture.url,
      },
    }, // Remove the extra opening curly brace here
    {
      new: true,
    }
  ).select("-password -refreshToken");

  if (!user) {
    throw new ApiError(
      500,
      "Internal Server error occurred while updating profile picture"
    );
  }
  return res
    .status(200)
    .json(new ApiResponse(200, user, "Profile Picture updated successfully"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;
  //console.log("incomingRefreshToken", incomingRefreshToken);
  if (!incomingRefreshToken) {
    throw new ApiError(400, "Refresh Token is required");
  }
  try {
    // firstly verify whether the incoming refresh token is correct or not
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
    const user = await User.findById(decodedToken?._id);
    if (!user) {
      throw new ApiError(401, "Invalid Refresh Token");
    }
    if (user.refreshToken !== incomingRefreshToken) {
      throw new ApiError(401, "Refresh Token is expired or used");
    }
    const { accessToken, refreshToken: newrefreshToken } =
      await generateAccessAndRefreshTokens(user._id);

    const options = {
      httpOnly: true, // only server can change the cookies
      secure: true, // https request only
    };
    //console.log(newrefreshToken);
    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newrefreshToken, options)
      .json(
        new ApiResponse(
          200,
          {
            accessToken,
            refreshToken: newrefreshToken,
          },
          "Access Token Refreshed Successfully"
        )
      );
  } catch (error) {
    console.log(error);
    throw new ApiError(401, "Invalid Refresh Token");
  }
});

const getUserProfile = asyncHandler(async (req, res) => {
  const { username } = req.params;
  if (!username) {
    throw new ApiError(400, "Username is required");
  }
  const user = await User.findOne({ username }).select(
    "-password -refreshToken"
  );
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, user, "User found successfully"));
});

const getUserById = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  console.log("userId", userId);
  if (!userId) {
    throw new ApiError(400, "User Id is required");
  }
  const user = await User.findById(userId).select("-password -refreshToken");
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, user, "User found successfully"));
});

export {
  register,
  loginUser,
  logout,
  changeFullnamePhoneNumber,
  changeCurrentPassword,
  changeProfilePicture,
  refreshAccessToken,
  getUserProfile,
  getCurrentlyLoggedInUser,
  getUserById,
};

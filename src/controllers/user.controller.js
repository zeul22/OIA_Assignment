import { asyncHandler } from "../utils/asyncHandler.js";
import { body, validationResult } from "express-validator";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Task } from "../models/task.model.js";

const generateAccessTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateToken();
    await user.save({ validateBeforeSave: false });
    return accessToken;
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating access token"
    );
  }
};

// validation
const validateUserCreation = [
  body("phoneNum")
    .notEmpty()
    .withMessage("Phone Number is required")
    .isLength({ min: 10, max: 10 })
    .withMessage("Phone Number must be 10 digits")
    .isNumeric()
    .withMessage("Phone Number must contain only digits")
    .custom(async (value) => {
      //check for user creation

      const existingUser = await User.findOne({ phoneNum: value });
      if (existingUser) {
        throw new Error("Phone Number already exists");
      }
    }),
  body("priority").isIn([0, 1, 2]).withMessage("Priority must be 0, 1, or 2"),
];

//Registration
const registerUser = asyncHandler(async (req, res) => {
  // user_details -- POSTMAN
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { phoneNum, priority } = req.body;
  try {
    // Create user
    const user = new User({ phoneNum, priority });
    //user object: entry in db
    await user.save();

    // return response
    res.status(201).json({ message: "User created successfully", user });
  } catch (error) {
    res.status(500).json({ error: errors.message });
  }
});

// Get All Users
const getallusers = asyncHandler(async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

//Login
const loginUser = asyncHandler(async (req, res) => {
  const { phoneNum } = req.body;

  if (!phoneNum) {
    throw new ApiError(400, "Phone Number is required!");
  }

  const user = await User.findOne({ phoneNum: phoneNum });
  if (!user) {
    throw new ApiError(404, "Phone Number does not exist");
  }

  const accessToken = await generateAccessTokens(user._id);

  const loggedInUser = await User.findById(user._id).select("-priority");

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
        },
        "User logged In Successfully"
      )
    );
});

//Logout
const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {},
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"));
});

const getAllUsersWithTasks = async (req, res) => {
  try {
    const usersWithTasks = await User.find().populate("tasks");

    res.status(200).json({ usersWithTasks });
  } catch (error) {
    console.error("Error fetching users with tasks:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export {
  registerUser,
  validateUserCreation,
  loginUser,
  logoutUser,
  getallusers,
  getAllUsersWithTasks,
};

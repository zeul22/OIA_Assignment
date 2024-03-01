import { asyncHandler } from "../utils/asyncHandler.js";
import { body, validationResult } from "express-validator";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";

const validateUserCreation = [
  body("phoneNum")
    .notEmpty()
    .withMessage("Phone Number is required")
    .isLength({ min: 10, max: 10 })
    .withMessage("Phone Number must be 10 digits")
    .isNumeric()
    .withMessage("Phone Number must contain only digits")
    .custom(async (value) => {
      const existingUser = await User.findOne({ phoneNum: value });
      if (existingUser) {
        throw new Error("Phone Number already exists");
      }
    }),
  body("priority").isIn([0, 1, 2]).withMessage("Priority must be 0, 1, or 2"),
];

//user object: entry in db
//check for user creation
// return response

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
    await user.save();
    res.status(201).json({ message: "User created successfully", user });
  } catch (error) {
    res.status(500).json({ error: errors.message });
  }
});

export { registerUser, validateUserCreation };

import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";

const user_schema = new Schema({
  phoneNum: {
    type: Number,
    required: [true, "Phone Number is required"],
    unique: true,
    lowercase: true,
    trim: true,
    index: true, 
  },
  priority: {
    type: Number,
    enum: [0, 1, 2],
    default: 0,
  },
});

//Token Generation
user_schema.methods.generateToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      phoneNum: this.phoneNum,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

export const User = mongoose.model("User", user_schema);

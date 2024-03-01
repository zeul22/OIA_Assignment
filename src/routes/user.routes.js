import { Router } from "express";
import {
  registerUser,
  validateUserCreation,
  loginUser,
  logoutUser,
} from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

//see app.js to understand
router.route("/register").post(validateUserCreation, registerUser); // /user/register
router.route("/login").post(loginUser);
router.route("/logout").post(verifyJWT, logoutUser);

export default router;

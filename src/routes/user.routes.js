import { Router } from "express";
import {
  registerUser,
  validateUserCreation,
} from "../controllers/user.controller.js";

const router = Router();

//see app.js to understand
router.route("/register").post(validateUserCreation, registerUser); // /user/register
export default router;

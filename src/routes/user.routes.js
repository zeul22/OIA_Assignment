import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";

const router = Router();

//see app.js to understand
router.route("/register").post(registerUser); // /user/register
export default router;

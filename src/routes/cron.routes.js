import { Router } from "express";
import cron from "cron";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { runCron, twilliojob } from "../controllers/cron.controller.js";
const router = Router();

router.use(verifyJWT);

router.route("/work").post(runCron);
router.route("/call").post(twilliojob);

export default router;

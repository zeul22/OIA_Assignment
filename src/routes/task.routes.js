import { Router } from "express";
import {
  createTask,
  softdelete,
  updateTask,
  getUserTasks,
  getAllUserTasks,
} from "../controllers/task.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();
router.use(verifyJWT); 

router.route("/create").post(createTask);
router.route("/user/:userId").get(getUserTasks);
router.route("/user/all/:userId").get(getAllUserTasks);
router.route("/update/:taskid").patch(updateTask);
router.route("/delete/:taskid").delete(softdelete);

export default router;

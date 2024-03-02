import { Router } from "express";
import {
  createSubTask,
  softdeleteSub,
  updateSubTask,
  getUserSubTasks,
  getAllUserSubTasks,
} from "../controllers/subtask.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();
router.use(verifyJWT); 

router.route("/create").post(createSubTask);
router.route("/user/:userId").get(getUserSubTasks);
router.route("/user/all/:userId").get(getAllUserSubTasks);
router.route("/update/:taskid").patch(updateSubTask);
router.route("/delete/:taskid").delete(softdeleteSub);

export default router;

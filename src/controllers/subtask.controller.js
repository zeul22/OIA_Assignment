import mongoose, { isValidObjectId } from "mongoose";
import { Subtask } from "../models/subtask.model.js";
import { Task } from "../models/task.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Create
const createSubTask = asyncHandler(async (req, res) => {
  const { status, task_id } = req.body; // Extract status and task_id from req.body
  let status1 = status + 1;
  if (!status1) {
    throw new ApiError(400, "status field is required!!");
  }
  try {
    status1 = status1 - 1;
    const subtask = await Subtask.create({
      task_id: task_id,
      status: status1,
    });
    if (!subtask) {
      throw new ApiError(500, "Unable to create subtask!!");
    }
    return res
      .status(200)
      .json(new ApiResponse(200, subtask, "Subtask published Successfully!!"));
  } catch (e) {
    throw new ApiError(500, e?.message || "Unable to create subtask");
  }
});

// Get All User SubTask (even the deleted ones)
const getAllUserSubTasks = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  if (!userId) {
    throw new ApiError(400, "userId is Required!!!");
  }
  try {
    const task = await Subtask.aggregate([
      {
        $match: {
          task_id: new mongoose.Types.ObjectId(userId),
        },
      },
      {
        $group: {
          _id: "task",
          tasks: {
            $push: {
              _id: "$_id",
              status: "$status",
              created_at: "$created_at",
              updated_at: "$updated_at",
              deleted_at: "$deleted_at",
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          tasks: 1,
        },
      },
    ]);
    if (!task || task.length === 0) {
      return res
        .status(200)
        .json(new ApiResponse(200, [], "User have no subtasks"));
    }
    return res
      .status(200)
      .json(
        new ApiResponse(200, task, "Task for the user fetched successfully!")
      );
  } catch (e) {
    throw new ApiError(500, e?.message || "Unable to fetch subtasks");
  }
});

const getUserSubTasks = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  if (!userId) {
    throw new ApiError(400, "userId is Required!!!");
  }
  try {
    const task = await Subtask.aggregate([
      {
        $match: {
          task_id: new mongoose.Types.ObjectId(userId),
          deleted_at: null,
        },
      },
      {
        $group: {
          _id: "task",
          tasks: {
            $push: {
              _id: "$_id",
              status: "$status",
              created_at: "$created_at",
              updated_at: "$updated_at",
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          tasks: 1,
        },
      },
    ]);
    if (!task || task.length === 0) {
      return res
        .status(200)
        .json(new ApiResponse(200, [], "User have no subtasks"));
    }
    return res
      .status(200)
      .json(
        new ApiResponse(200, task, "Task for the user fetched successfully!")
      );
  } catch (e) {
    throw new ApiError(500, e?.message || "Unable to fetch subtasks");
  }
});

const updateSubTask = asyncHandler(async (req, res) => {
  const { taskid } = req.params;

  if (!taskid) {
    throw new ApiError(400, "Task ID is required");
  }

  try {
    const existingSubTask = await Subtask.findById(taskid);

    if (!existingSubTask) {
      throw new ApiError(404, "Subtask does not exist");
    }

    if (existingSubTask.deleted_at !== null) {
      throw new ApiError(404, "Subtask does not exist");
    }

    const { status } = req.body;
    if (status === undefined || status === null) {
      throw new ApiError(400, "Status is required");
    }

    const updatedSubTask = await Subtask.findByIdAndUpdate(
      taskid,
      {
        $set: {
          status: status,
          updated_at: Date.now(),
        },
      },
      {
        new: true,
      }
    );

    if (!updatedSubTask) {
      throw new ApiError(500, "Unable to update Subtask");
    }

    return res
      .status(200)
      .json(
        new ApiResponse(200, updatedSubTask, "Subtask updated successfully")
      );
  } catch (e) {
    throw new ApiError(500, e.message || "Unable to update Subtask");
  }
});

//soft delete
const softdeleteSub = asyncHandler(async (req, res) => {
  const { taskid } = req.params;

  if (!mongoose.Types.ObjectId.isValid(taskid)) {
    return res.status(400).json({ message: "Invalid task ID." });
  }

  try {
    const task = await Subtask.findById(taskid);

    if (!task) {
      return res.status(404).json({ message: "Task not found." });
    }

    if (task.deleted_at) {
      return res.status(400).json({ message: "Task already soft-deleted." });
    }

    task.deleted_at = new Date();
    await task.save();

    return res.status(200).json({ message: "Task soft-deleted successfully." });
  } catch (error) {
    console.error("Error occurred while soft-deleting task:", error);
    return res.status(500).json({ message: "Unable to soft-delete task." });
  }
});

export {
  createSubTask,
  getAllUserSubTasks,
  getUserSubTasks,
  updateSubTask,
  softdeleteSub,
};

import mongoose, { isValidObjectId } from "mongoose";
import { Task } from "../models/task.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Subtask } from "../models/subtask.model.js";

const createTask = asyncHandler(async (req, res) => {
  const { title, description, due_date, priority } = req.body;
  if (!title || !description || !due_date || !priority) {
    throw new ApiError(400, "All fields are required!!");
  }
  try {
    const task = await Task.create({
      title: title,
      user: req.user?._id,
      description: description,
      due_date: due_date,
      priority: priority,
    });
    if (!task) {
      throw new ApiError(500, "Unable to create task!!");
    }
    return res
      .status(200)
      .json(new ApiResponse(200, task, "Task published Successfully!!"));
  } catch (e) {
    throw new ApiError(500, e?.messgae || " Unable to create task");
  }
});

const getAllUserTasks = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  if (!userId) {
    throw new ApiError(400, "userId is Required!!!");
  }
  try {
    const task = await Task.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(userId),
        },
      },
      {
        $group: {
          _id: "user",
          tasks: {
            $push: {
              _id: "$_id",
              title: "$title",
              description: "$description",
              status: "$status",
              due_date: "$due_date",
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
        .json(new ApiResponse(200, [], "User have no tasks"));
    }
    return res
      .status(200)
      .json(
        new ApiResponse(200, task, "Task for the user fetched successfully!")
      );
  } catch (e) {
    throw new ApiError(500, e?.message || "Unable to fetch Tasks");
  }
});

const getUserTasks = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  if (!userId) {
    throw new ApiError(400, "userId is Required!!!");
  }
  try {
    const task = await Task.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(userId),
          deleted_at: null,
        },
      },
      {
        $group: {
          _id: "user",
          tasks: {
            $push: {
              _id: "$_id",
              title: "$title",
              description: "$description",
              status: "$status",
              due_date: "$due_date",
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
        .json(new ApiResponse(200, [], "User have no tasks"));
    }
    return res
      .status(200)
      .json(
        new ApiResponse(200, task, "Task for the user fetched successfully!")
      );
  } catch (e) {
    throw new ApiError(500, e?.message || "Unable to fetch Tasks");
  }
});

const updateTask = asyncHandler(async (req, res) => {
  const { taskid } = req.params;

  if (!taskid) {
    throw new ApiError(400, "Fields are required!!");
  }
  try {
    const existingTask = await Task.findById(taskid);

    if (!existingTask) {
      throw new ApiError(404, "Task does not exist");
    }
    if (existingTask.deleted_at !== null) {
      throw new ApiError(404, "Task does not exist");
    }
    const { status, due_date } = req.body;
    if (!status || !due_date) {
      throw new ApiError(404, "Fields are required");
    }
    //user is owner or not
    if (existingTask.user.toString() != req.user?._id?.toString()) {
      throw new ApiError(300, "Unuthorized Access");
    }
    const updatedTask = await Task.findByIdAndUpdate(
      taskid,
      {
        $set: {
          status: status,
          due_date: due_date,
          updated_at: Date.now(),
        },
      },
      {
        new: true,
      }
    );
    if (!updatedTask) {
      throw new ApiError(500, "Unable to update Task");
    }

    await Subtask.updateMany(
      { task_id: taskid },
      {
        $set: {
          status: 1,
          updated_at: Date.now(),
        },
      }
    );

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          updatedTask,
          "Task & Subtasks updated Successfully"
        )
      );
  } catch (e) {
    throw new ApiError(500, e?.message || "Unable to update Task");
  }
});

//soft delete
const softdelete = asyncHandler(async (req, res) => {
  const { taskid } = req.params;

  if (!mongoose.Types.ObjectId.isValid(taskid)) {
    return res.status(400).json({ message: "Invalid task ID." });
  }

  try {
    // Find the task by ID
    const task = await Task.findById(taskid);

    // Check if the task exists
    if (!task) {
      return res.status(404).json({ message: "Task not found." });
    }

    // Check if the task has already been soft-deleted
    if (task.deleted_at) {
      return res.status(400).json({ message: "Task already soft-deleted." });
    }

    // Soft delete the task
    task.deleted_at = new Date();
    await task.save();

    // Respond with success message
    return res.status(200).json({ message: "Task soft-deleted successfully." });
  } catch (error) {
    // Handle errors
    console.error("Error occurred while soft-deleting task:", error);
    return res.status(500).json({ message: "Unable to soft-delete task." });
  }
});

export { createTask, getAllUserTasks, getUserTasks, updateTask, softdelete };

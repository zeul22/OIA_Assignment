import mongoose, { Schema } from "mongoose";

const taskSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  title: {
    type: String,
    required: [true, "Title is required"],
  },
  description: {
    type: String,
    required: [true, "description is required"],
  },
  due_date: {
    type: Number,
    required: [true, "due_date is required"],
  },
  priority: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ["todo", "progress", "done"],
    default: "todo",
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  updated_at: {
    type: Date,
    default: Date.now,
  },

  deleted_at: {
    type: Date,
    default: null,
  },
});

export const Task = mongoose.model("Task", taskSchema);

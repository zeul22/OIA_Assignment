
import mongoose, { Schema } from "mongoose";

const subtaskSchema = new Schema({
  task_id: {
    type: Schema.Types.ObjectId,
    ref: "Task",
  },
  status: {
    type: Number,
    enum: [0, 1],
    default: 0,
    required: [true, "Status is required"],
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

export const Subtask = mongoose.model("Subtask", subtaskSchema);

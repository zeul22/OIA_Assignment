// id (int, unique identifier)
// task_id (int)//references task table
// status (0,1) //0- incomplete, 1- complete
// created_at (date/string)
// updated_at (date/string)
// deleted_at (date/string)

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

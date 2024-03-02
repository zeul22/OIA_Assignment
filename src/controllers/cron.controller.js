import { asyncHandler } from "../utils/asyncHandler.js";
import { Task } from "../models/task.model.js";
import { User } from "../models/user.model.js";
import cron from "node-cron";
import twilio from "twilio";

const runCron = asyncHandler(async (req, res) => {
  cron.schedule("* * * * * *", async () => {
    try {
      const tasksToUpdate = await Task.find({
        due_date: { $lt: new Date() },
        priority: { $lt: 0 },
      });

      await Promise.all(
        tasksToUpdate.map(async (task) => {
          task.priority -= 1;
          await task.save();
        })
      );

      console.log("Priority updated for overdue tasks.");
      res.status(200).json({ message: "Cron job executed successfully" });
    } catch (error) {
      console.error("Error updating task priorities:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
});

async function makeVoiceCall(phoneNum) {
  await twilioClient.calls.create({
    to: phoneNum,
    from: process.env.NUM,
    url: "http://demo.twilio.com/docs/voice.xml",
  });
}

const twilliojob = asyncHandler(async (req, res) => {
  const twilioClient = new twilio(process.env.SID, process.env.SID_AUTH);

  // Done Everyday
  cron.schedule("* * * * *", async () => {
    try {

      const overdueTasks = await Task.find({
        due_date: { $lt: new Date() },
      }).populate("user");

      for (const task of overdueTasks) {
        const userPriority = task.user?.priority; 
        if (userPriority !== undefined) {
          const lowerPriorityTasks = await Task.find({
            user: { $ne: task.user._id },
            priority: { $lt: userPriority },
            status: { $ne: ["todo", "progress"] },
          }).sort({ priority: -1 });

          if (lowerPriorityTasks.length === 0) {
            await makeVoiceCall(task.user.phoneNum);
            task.status = "done";
            await task.save();
          }
        }
      }
      console.log("Priority updated for overdue tasks.");
      res.status(200).json({ message: "Cron job executed successfully" });
    } catch (error) {
      console.error("Error updating task priorities:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
});

export { runCron, twilliojob };

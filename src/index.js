import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./app.js";
dotenv.config({
  path: "../.env",
});

// Connection to Database
connectDB()
  .then(() => {
    app.listen(process.env.PORT || 8000, () => {
      console.log(`Server is running at port ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log("MONGODB CONNECTION FAILED!");
  });
// restart the program if connection fails

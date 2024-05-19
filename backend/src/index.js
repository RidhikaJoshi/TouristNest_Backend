// require("dotenv").config({ path: "./env" });
// it does not maintain consistency for import statement
import dotenv from "dotenv";
import connectDB from "./db/index.js";
import app from "./app.js";

dotenv.config();
connectDB()
  .then(() => {
    app.on("error", (error) => {
      // using arrow function to catch error occured in connecting express and database
      console.log("Error occured in server", error);
      throw error; // if any error ocuurrred in connecting express and database then it will throw error
    });
    app.listen(process.env.PORT || 4000, () => {
      console.log(`Server is running on port ${process.env.PORT}`);
    }); // to check whether connection is established or not
  })
  .catch((err) => {
    console.log("Error occured in connecting to database", err);
  });

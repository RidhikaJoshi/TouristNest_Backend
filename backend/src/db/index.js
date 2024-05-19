import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URI}/${DB_NAME}`
    ); // mongoose gives you returned object
    console.log(
      `MongoDb connected, DB HOST: ${connectionInstance.connection.host}`
    );
  } catch (error) {
    console.log("Error occurred while connecting to database", error);
    process.exit(1);
  }
};
export default connectDB;

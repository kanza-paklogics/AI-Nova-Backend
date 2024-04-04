import mongoose from "mongoose";
import config from "config";

const dbUrl = `mongodb+srv://${config.get("dbUserName")}:${config.get(
  "dbPass"
)}@cluster0.${config.get<string>("clusterId")}.mongodb.net/${config.get(
  "dbName"
)}?authSource=admin`;

console.log(dbUrl);
const connectDB = async () => {
  try {
    await mongoose.connect(dbUrl);
    console.log("Database connected...");
  } catch (error: any) {
    console.log(error.message);
    setTimeout(connectDB, 5000);
  }
};

export default connectDB;

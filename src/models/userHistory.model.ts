import { Schema, model } from "mongoose";

const userHistory = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  searchData: {
    type: Schema.Types.String,
    required: true,
  },
});

const Model = model("userHistory", userHistory);
export default Model;

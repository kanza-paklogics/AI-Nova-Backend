import { Schema, model } from "mongoose";

const userLinks = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  searchLink: {
    type: Schema.Types.String,
    required: true,
  },
});

const Model = model("userLinks", userLinks);
export default Model;

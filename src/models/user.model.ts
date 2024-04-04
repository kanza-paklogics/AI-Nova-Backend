import { Schema, model } from "mongoose";

const User = new Schema(
  {
    firstName: {
      type: Schema.Types.String,
      required: true,
    },
    lastName: {
      type: Schema.Types.String,
      required: true,
    },
    email: {
      type: Schema.Types.String,
      required: true,
      unique: true,
    },
    age: {
      type: Schema.Types.Number,
    },
    password: {
      type: Schema.Types.String,
    },
    status: {
      type: Schema.Types.String,
      default: "Inactive",
    },
    otp: {
      type: Schema.Types.String,
      default: null,
    },
    forgetPassword: {
      type: Schema.Types.Boolean,
      default: false,
    },
    imgUrl: {
      type: Schema.Types.String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Model = model("User", User);
export default Model;

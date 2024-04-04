import { omit } from "lodash";
import { FilterQuery, QueryOptions } from "mongoose";
import config from "config";
import userModel from "../models/user.model";
import userHistory from "../models/userHistory.model";
import userLinks from "../models/userLinks.models";
import { excludedFields } from "../controllers/auth.controller";
import { signJwt } from "../utils/jwt";
import redisClient from "../utils/connectRedis";
const otpGenerator = require("otp-generator");
import sendMail from "../utils/sendMail";
import bcrypt from "bcryptjs";

// CreateUser service
export const createUser = async (input: Partial<any>) => {
  const user = await userModel.create(input);
  return omit(user.toJSON(), excludedFields);
};

// Find User by Id
export const findUserById = async (id: any) => {
  const user = await userModel.findById(id);
  return omit(user, excludedFields);
};

// Find All users
export const findAllUsers = async () => {
  return await userModel.find();
};

// Find one user by any fields
export const findUser = async (
  query: FilterQuery<any>,
  options: QueryOptions = {}
) => {
  return await userModel
    .findOne(query, {}, options)
    .select("-__v -createdAt -updatedAt");
};

// Sign Token
export const signToken = async (user: any) => {
  // Sign the access token
  console.log("User is :", user);
  const access_token = signJwt({ sub: user._id }, "accessTokenPrivateKey", {
    expiresIn: `${config.get<number>("accessTokenExpiresIn")}m`,
  });

  // Sign the refresh token
  const refresh_token = signJwt({ sub: user._id }, "refreshTokenPrivateKey", {
    expiresIn: `${config.get<number>("accessTokenExpiresIn")}m`,
  });

  console.log("user ---->", user);

  // Create a Session
  await redisClient.set(user._id.toString(), JSON.stringify(user), {
    EX: 60 * 60 * 5,
  });

  // Return access token
  return { access_token, refresh_token };
};

export const resetPasswordRequest = async (email: string) => {
  try {
    const otp: string = otpGenerator.generate(4, {
      upperCaseAlphabets: false,
      specialChars: false,
    });

    await userModel.findOneAndUpdate(
      {
        email,
      },
      {
        $set: {
          otp,
          forgetPassword: true,
        },
      }
    );

    return sendMail(email, "OTP for reset password", `Your OTP is:  ${otp}`);
  } catch (error) {
    throw error;
  }
};

export const verityOTP = async (email: string, otp: string) => {
  try {
    return await userModel.findOneAndUpdate(
      {
        email,
        otp,
      },
      {
        $set: {
          otp: null,
        },
      }
    );
  } catch (error) {
    throw error;
  }
};

export const resetPassword = async (email: string, password: string) => {
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    return await userModel.findOneAndUpdate(
      {
        email,
      },
      {
        $set: {
          password: hashedPassword,
          forgetPassword: false,
        },
      }
    );
  } catch (error: any) {
    throw error;
  }
};

export const saveHistory = async (query: any) => {
  try {
    return await userHistory.create(query);
  } catch (error) {
    throw error;
  }
};

export const saveLink = async (query: any) => {
  try {
    return await userLinks.create(query);
  } catch (error) {
    throw error;
  }
};

export const UserHistory = async (userId: any) => {
  try {
    const history: any = await userHistory.find({ userId });
    const data = history.map((his: any) => {
      return {
        id: his._id,
        search: his.searchData,
      };
    });
    return data;
  } catch (error) {
    throw error;
  }
};

export const UserLinks = async (userId: any) => {
  try {
    const history: any = await userLinks.find({ userId });
    const data = history.map((his: any) => {
      return {
        id: his._id,
        link: his.searchLink,
      };
    });
    return data;
  } catch (error) {
    throw error;
  }
};

export const deleteHistory_service = async (id: any, userId: any) => {
  try {
    await userHistory.deleteOne({ _id: id });
    return UserHistory(userId);
  } catch (error) {
    throw error;
  }
};

export const deleteLink_service = async (id: any, userId: any) => {
  try {
    await userLinks.deleteOne({ _id: id });
    return UserLinks(userId);
  } catch (error) {
    throw error;
  }
};

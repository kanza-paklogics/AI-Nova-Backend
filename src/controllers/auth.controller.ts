import config from "config";
import bcrypt from "bcryptjs";
const { OAuth2Client } = require("google-auth-library");
import {
  CookieOptions,
  NextFunction,
  Request,
  Response,
  response,
} from "express";
import {
  createUser,
  findUser,
  findUserById,
  signToken,
  resetPasswordRequest,
  verityOTP,
  resetPassword,
} from "../services/user.service";
import AppError from "../utils/appError";
import redisClient from "../utils/connectRedis";
import { signJwt, verifyJwt } from "../utils/jwt";

// import { uploadProfile } from "../utils/uploading_S3";

// Exclude this fields from the response
// Exclude this fields from the response
// Exclude this fields from the response
export const excludedFields = [ "password", "__v", "createdAt", "updatedAt" ];

// Cookie options
const accessTokenCookieOptions: CookieOptions = {
  expires: new Date(
    Date.now() + config.get<number>("accessTokenExpiresIn") * 60 * 1000
  ),
  maxAge: config.get<number>("accessTokenExpiresIn") * 60 * 1000,
  httpOnly: true,
  sameSite: "lax",
};

const refreshTokenCookieOptions: CookieOptions = {
  expires: new Date(
    Date.now() + config.get<number>("refreshTokenExpiresIn") * 60 * 1000
  ),
  maxAge: config.get<number>("refreshTokenExpiresIn") * 60 * 1000,
  httpOnly: true,
  sameSite: "lax",
};

// Only set secure to true in production
if (process.env.NODE_ENV === "production")
  accessTokenCookieOptions.secure = true;

export const registerHandler = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    // const profile: any = await uploadProfile(
    //   `/profile/${Date.now() + req.file.originalname}`,
    //   config.get<string>("BucketS3"),
    //   req.file.buffer
    // );

    const user = await createUser({
      ...req.body,
      password: hashedPassword,
    });
    console.log("user", user);
    return res.status(201).json({
      success: true,
      data: {
        user,
      },
    });
  } catch (err: any) {
    console.log("Error processing", err);
    if (err.code === 11000) {
      return res.status(409).json({
        status: "fail",
        message: "Email already exist",
      });
    }
    next(err);
  }
};

export const loginHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get the user from the collection
    const user: any = await findUser({ email: req.body.email });
    console.log("User ->", user);

    if (user.forgetPassword) {
      return res.status(200).send({
        success: false,
        message: "Please reset your password first then login",
      });
    }
    console.log("User password ->", user.password);
    console.log("Req password ->", req.body.password);

    // Check if user exist and password is correct
    if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
      return next(new AppError("Invalid email or password", 401));
    }

    // Create the Access and refresh Tokens
    const { access_token, refresh_token } = await signToken(user);

    // Send Access Token in Cookie
    res.cookie("access_token", access_token, accessTokenCookieOptions);
    res.cookie("refresh_token", refresh_token, refreshTokenCookieOptions);
    res.cookie("logged_in", true, {
      ...accessTokenCookieOptions,
      httpOnly: false,
    });

    // Send Access Token
    res.status(200).json({
      status: "success",
      access_token,
      user,
    });
  } catch (err: any) {
    next(err);
  }
};

// Refresh tokens
const logout = (res: Response) => {
  res.cookie("access_token", "", { maxAge: 1 });
  res.cookie("refresh_token", "", { maxAge: 1 });
  res.cookie("logged_in", "", {
    maxAge: 1,
  });
};

export const refreshAccessTokenHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get the refresh token from cookie
    const refresh_token = req.cookies.refresh_token as string;

    // Validate the Refresh token
    const decoded = verifyJwt<{ sub: string }>(
      refresh_token,
      "refreshTokenPublicKey"
    );
    const message = "Could not refresh access token";
    if (!decoded) {
      return next(new AppError(message, 403));
    }

    // Check if the user has a valid session
    const session = await redisClient.get(decoded.sub);
    if (!session) {
      return next(new AppError(message, 403));
    }

    // Check if the user exist
    const user = await findUserById(JSON.parse(session)._id);

    if (!user) {
      return next(new AppError(message, 403));
    }

    // Sign new access token
    const access_token = signJwt({ sub: user._id }, "accessTokenPrivateKey", {
      expiresIn: `${config.get<number>("accessTokenExpiresIn")}m`,
    });

    // Send the access token as cookie
    res.cookie("access_token", access_token, accessTokenCookieOptions);
    res.cookie("logged_in", true, {
      ...accessTokenCookieOptions,
      httpOnly: false,
    });

    // Send response
    res.status(200).json({
      status: "success",
      access_token,
    });
  } catch (err: any) {
    next(err);
  }
};

export const logoutHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = res.locals.user;
    await redisClient.del(user._id.toString());
    logout(res);
    return res.status(200).json({ status: "success" });
  } catch (err: any) {
    next(err);
  }
};

export const resetPasswordReq = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const password: any = await resetPasswordRequest(req.body.email);
    return res.status(200).send({
      success: true,
      message: "Password reset OTP sent to your email",
    });
  } catch (err: any) {
    next(err);
  }
};

export const verifyOtp = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const otp: any = await verityOTP(req.body.email, req.body.otp);
    if (!otp)
      return next(new AppError("OTP not verified, please try again", 400));
    return res
      .status(200)
      .send({ success: true, message: "OTP verified successfully" });
  } catch (error) {
    next(error);
  }
};

export const resetPass = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const password: any = await resetPassword(
      req.body.email,
      req.body.password
    );
    if (!password)
      return next(new AppError("Password not reset, please try again", 400));
    return res
      .status(200)
      .send({ success: true, message: "Password reset successfully" });
  } catch (error) {
    next(error);
  }
};

export const gooleLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { idToken } = req.body;
    console.log("config: ", config);
    const googleclientid = config.get<string>("googleClientId");
    console.log("Here");
    const googleClient = new OAuth2Client(googleclientid);

    const loginUser = async (user: any) => {
      return await signToken(user);
    };
    const verifyIdTokenPromise: any = await googleClient
      .verifyIdToken({
        idToken,
        // audience: googleclientid,
      })
      .then(async (response: any) => {
        if (response.payload.email_verified) {
          console.log(response.payload);
          let user: any = await findUser({ email: response.payload.email });
          let tokens: any = {};
          if (!user) {
            //create new user
            const hashedPassword = await bcrypt.hash(
              `${response.payload.email}+${idToken}`,
              10
            );
            user = await createUser({
              firstName: response.payload.given_name,
              lastName: response.payload.family_name,
              email: response.payload.email,
              status: "Active",
              imgUrl: response.payload.picutre,
              password: hashedPassword,
            });
          }
          tokens = await loginUser(user);

          res.cookie(
            "access_token",
            tokens.access_token,
            accessTokenCookieOptions
          );
          res.cookie(
            "refresh_token",
            tokens.refresh_token,
            refreshTokenCookieOptions
          );
          res.cookie("logged_in", true, {
            ...accessTokenCookieOptions,
            httpOnly: false,
          });

          // Send Access Token
          return res.status(200).json({
            success: true,
            access_token: tokens.access_token,
            user,
          });
        } else {
          return res.status(200).send({
            success: false,
            message: "User not authenticated by Google, please try again ",
          });
        }
      });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

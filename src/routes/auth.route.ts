import express from "express";
import {
  loginHandler,
  logoutHandler,
  resetPasswordReq,
  registerHandler,
  verifyOtp,
  resetPass,
  gooleLogin,
} from "../controllers/auth.controller";
import { deserializeUser } from "../middleware/deserializeUser";
import { requireUser } from "../middleware/requireUser";
import { upload1 } from "../middleware/multer";

// import { createUserSchema, loginUserSchema } from '../schema/user.schema';

const router = express.Router();

//google login
router.post("/google-login", gooleLogin);

// Register user route
router.post("/register", registerHandler);

// Login user route
router.post("/login", loginHandler);

// Reset password Request
router.post("/reset-password-request", resetPasswordReq);

//verify otp
router.post("/verify-otp", verifyOtp);

//reset password
router.post("/reset-password", resetPass);

//google login

router.use(deserializeUser, requireUser);

// Logout User
router.get("/logout", logoutHandler);

export default router;

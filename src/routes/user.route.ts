import express from "express";
import {
  getAllUsersHandler,
  getHistoryHandler,
  getMeHandler,
  uploadHandler,
  deleteHistory,
  getFetchLinks,
  storeLink,
  getLinks,
  deleteLink,
} from "../controllers/user.controller";
import { deserializeUser } from "../middleware/deserializeUser";
import { requireUser } from "../middleware/requireUser";
import { upload2 } from "../middleware/multer";

console.log("Upload 2 is :", upload2);

const router = express.Router();
router.use(deserializeUser, requireUser);
// Get my info route
router.get("/profile", getMeHandler);

//Uploading file to server
router.post("/upload-audio", upload2.array('file'), uploadHandler);

//get user's hitory
router.get("/history", getHistoryHandler);

//delete history item
router.delete("/history/:id", deleteHistory);

//fetching links
router.post("/fetch-links", getFetchLinks);

//store link
router.post("/store-link", storeLink);

//get links
router.get("/links", getLinks);

//delete Link
router.delete("/links/:id", deleteLink);

module.exports = router;

//upload file
export default router;

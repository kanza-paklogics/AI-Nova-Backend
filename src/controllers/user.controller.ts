import { NextFunction, Request, Response } from "express";


import { uploadImage } from "../utils/uploading_GCP"
import {
  UserHistory,
  findAllUsers,
  saveHistory,
  deleteHistory_service,
  saveLink,
  UserLinks,
  deleteLink_service,
} from "../services/user.service";
import axios from "axios";



export const getMeHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = res.locals.user;
    res.status(200).json({
      status: "success",
      data: {
        user,
      },
    });
  } catch (err: any) {
    next(err);
  }
};

export const getAllUsersHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const users = await findAllUsers();
    res.status(200).json({
      status: "success",
      result: users.length,
      data: {
        users,
      },
    });
  } catch (err: any) {
    next(err);
  }
};

export const uploadHandler = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log("abc", req.files[ 0 ]);

    const imageUrl = await uploadImage(req.files[ 0 ])

    return res.status(200).send({
      success: true,
      message: "Audio uploaded successfully",
      data: imageUrl,
    });
  } catch (error) {
    next(error);
  }
};

export const getHistoryHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log("Locas is ", res.locals);
  try {
    const user: any = await UserHistory(res.locals.user._id);
    if (!user)
      return res
        .status(200)
        .send({ success: false, message: "No History found" });
    return res.status(200).send({
      success: true,
      data: {
        id: res.locals.user._id,
        data: user,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteHistory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log(req.params.id);
    const history: any = await deleteHistory_service(
      req.params.id,
      res.locals.user._id
    );

    return res.status(200).send({
      success: true,
      message: "History deleted successfully",
      data: {
        id: res.locals.user._id,
        data: history,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getFetchLinks = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const links = await axios.post(
      "https://api.ai.nova.paklogics.com/fetch_links",
      req.body,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    console.log("Links ", links);

    await saveHistory({
      userId: res.locals.user._id,
      searchData: req.body.query,

      //
    });

    return res.status(200).send({ success: true, links: links.data });
  } catch (error) {
    next(error);
  }
};

export const storeLink = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await saveLink({
      userId: res.locals.user._id,
      searchLink: req.body.link,
    });
    return res
      .status(200)
      .send({ success: true, message: "Link saved successfully" });
  } catch (error) {
    next(error);
  }
};

export const getLinks = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user: any = await UserLinks(res.locals.user._id);
    if (!user)
      return res
        .status(200)
        .send({ success: false, message: "No Links found" });
    return res.status(200).send({
      success: true,
      data: {
        id: res.locals.user._id,
        data: user,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteLink = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const history: any = await deleteLink_service(
      req.params.id,
      res.locals.user._id
    );

    return res.status(200).send({
      success: true,
      message: "Link deleted successfully",
      data: {
        id: res.locals.user._id,
        data: history,
      },
    });
  } catch (error) {
    next(error);
  }
};

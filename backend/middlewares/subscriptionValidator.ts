import { NextFunction, Request, Response } from "express";
import UserModel from "../Database/Models/user.model";

export const checkIsUserWithSubscription = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    /*
    const userId = req["userId"];
    const userHaveSubscription = await UserModel.userHaveSubscription(userId);
    if (!userHaveSubscription) {
      return res.status(402).send();
    }
    */
    return next();
  } catch (err) {
    return res.status(400).send();
  }
};

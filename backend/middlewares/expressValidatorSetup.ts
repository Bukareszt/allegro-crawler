import { IResponseMsg } from "../types/Controllers.types";
import prepareResponse from "../utills/Response/prepareResponse";
import { Request, Response, NextFunction } from "express";

import { body, validationResult } from "express-validator";
import UserModel from "../Database/Models/user.model";

export const crawlerArgumentsValidationRules = () => {
  return [
    body("*.countOfProductsToCheck")
      .isInt({ min: 10, max: 6000 })
      .withMessage("Count of Products to Check must be between 10 and 6000"),
    body("*.category")
      .isLength({ min: 1 })
      .withMessage("Category must be providen!"),
    body("*.sellersLogins").exists(),
    body("*.saveFile")
      .exists()
      .withMessage("Save file must be providen")
      .isBoolean()
      .withMessage("Save file must be boolean"),
    body("*.deepSearch").isBoolean().withMessage("DeepSearch must be boolean"),
    body("*.sortBy")
      .isIn([
        "+price",
        "-price",
        "+withDeliveryPrice",
        "-withDeliveryPrice",
        "-popularity",
      ])
      .withMessage("SortBy arguments must have value from SortBy Enum"),
  ];
};

export const crawlerArgumentsForConfigValidationRules = () => {
  return [
    body("*.countOfProductsToCheck")
      .isInt({ min: 10, max: 6000 })
      .withMessage("Count of Products to Check must be between 10 and 6000"),
    body("*.category")
      .isLength({ min: 1 })
      .withMessage("Category must be providen!"),
    body("*.sellersLogins").exists(),
    body("*.saveFile").isBoolean().withMessage("Save file must be boolean"),
    body("*.deepSearch").isBoolean().withMessage("DeepSearch must be boolean"),
    body("*.sortBy")
      .isIn([
        "+price",
        "-price",
        "+withDeliveryPrice",
        "-withDeliveryPrice",
        "-popularity",
      ])
      .withMessage("SortBy arguments must have value from SortBy Enum"),
    body("*.nameOfCrawler")
      .exists()
      .withMessage("Name Of Crawler must be providen!"),
  ];
};

export const dailyCrawlerArgumentsValidationRules = () => {
  return [
    body("crawlerArguments.countOfProductsToCheck")
      .isInt({ min: 10, max: 6000 })
      .withMessage("Count of Products to Check must be between 10 and 6000"),
    body("crawlerArguments.category")
      .isLength({ min: 1 })
      .withMessage("Category must be providen!"),
    body("crawlerArguments.sellersLogins").exists(),
    body("crawlerArguments.saveFile")
      .exists()
      .withMessage("Save file must be providen")
      .isBoolean()
      .withMessage("Save file must be boolean"),
    body("crawlerArguments.deepSearch")
      .exists()
      .withMessage("DeepSearch must be providen")
      .isBoolean()
      .withMessage("DeepSearch must be boolean"),
    body("crawlerArguments.sortBy")
      .exists()
      .withMessage("DeepSearch must be providen")
      .isIn([
        "+price",
        "-price",
        "+withDeliveryPrice",
        "-withDeliveryPrice",
        "-popularity",
      ])
      .withMessage("SortBy arguments must have value from SortBy Enum"),
    body("crawlerArguments.nameOfCrawler")
      .exists()
      .withMessage("Name Of Crawler must be providen!"),
    body("timeArguments.hourOfCrawling")
      .isInt({ min: 0, max: 23 })
      .withMessage("Hour of Crawling must be between 0 and 23"),
    body("timeArguments.minuteOfCrawling")
      .isInt({ min: 0, max: 59 })
      .withMessage("Hour of Crawling must be between 0 and 59"),
  ];
};
export const emailValidationRules = () => {
  return [body("email").isEmail().withMessage("Email is required!")];
};

export const emailWithPasswordValidationRules = () => {
  return [
    body("email").isEmail().withMessage("Email is required!"),
    body("password").matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[\^$*.\[\]{}\(\)?\-“!@#%&/,><\’:;|_~`])\S{8,99}$/
    ),
  ];
};

export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const extractedErrors = [];
    errors.array().map((err) => extractedErrors.push({ [err.param]: err.msg }));

    const responseObject: IResponseMsg = prepareResponse(
      "Bad request! Check error message!",
      extractedErrors
    );
    return res.status(400).json(responseObject);
  }

  return next();
};

export async function validateSaveFileArgument(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const userId = req["userId"];
  const { crawlerArguments } = req.body;

  try {
    if (crawlerArguments.saveFile) {
      const userHaveSubscription = await UserModel.userHaveSubscription(userId);
      if (!userHaveSubscription) {
        const responseObject: IResponseMsg = prepareResponse(
          "Bad request! Check error message!",
          "User with given Id can t save files!"
        );
        return res.status(402).json(responseObject);
      }
    }
    next();
  } catch (err) {
    const responseObject: IResponseMsg = prepareResponse(
      "Bad request! Check error message!",
      err.message
    );
    return res.status(400).json(responseObject);
  }
}

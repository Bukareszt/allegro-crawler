import CognitoExpress from "cognito-express";
import { NextFunction, Request, Response } from "express";
import UserModel from "../Database/Models/user.model";
import { IResponseMsg } from "../types/Controllers.types";
import prepareResponse from "../utills/Response/prepareResponse";

export const cognitoExpress = new CognitoExpress({
  region: process.env.AWS_COGNITO_REGION,
  cognitoUserPoolId: process.env.AWS_COGNITO_USER_POOL_ID,
  tokenUse: "id",
  tokenExpiration: 3600000,
});

export default function tokenValidator(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const accessTokenFromClient = req.headers.authorization;

  if (!accessTokenFromClient) {
    const responseObject: IResponseMsg = prepareResponse(
      "Bad request! Check error message!",
      "Access Token missing from header"
    );
    return res.status(401).json(responseObject);
  }

  cognitoExpress.validate(accessTokenFromClient, async (err, response) => {
    if (err) return res.status(401).send(err);
    try {
      const user = await UserModel.findOne({ email: response.email });
      const responseObject: IResponseMsg = prepareResponse(
        "Bad request! Check error message!",
        "No saved user with given Email in DB!"
      );

      if (!user) {
        return res.status(400).json(responseObject);
      }

      req["userId"] = user._id;

      return next();
    } catch (err) {
      const responseObject: IResponseMsg = prepareResponse(
        "Bad request! Check error message!",
        err.message
      );
      return res.status(401).json(responseObject);
    }
  });
}

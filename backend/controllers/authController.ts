import { Request, Response } from "express";
import { IAuthController, IResponseMsg } from "../types/Controllers.types";
import dotenv from "dotenv";
import authHandler from "../auth/authHandler";
import prepareResponse, {
  prepareResponseWithData,
} from "../utills/Response/prepareResponse";
import UserModel, { IUser } from "../Database/Models/user.model";
import handleError from "./utills/errorHandler";
import {
  IAuthorizationRequestWithCode,
  IAuthorizationRequest,
} from "../types/UserLogic.types";

dotenv.config();

export default class AuthController implements IAuthController {
  public async generateToken(
    req: Request<{}, {}, IAuthorizationRequest>,
    res: Response
  ): Promise<void> {
    const { email, password } = req.body;

    return handleError(req, res, async () => {
      const dataToSend = await authHandler.handleGeneratingTokenAndUserData(
        email,
        password
      );

      const response = prepareResponseWithData(
        "Login request accepted",
        dataToSend
      );
      return res.status(200).json(response);
    });
  }

  public async getUserSessionData(
    req: Request<{}, {}, { email: string }>,
    res: Response
  ) {
    const { email } = req.body;
    const userId: string = req["userId"];
    return handleError(req, res, async () => {
      const dataToSend = await authHandler.handleRestoreSessionData(
        email,
        userId
      );

      const response = prepareResponseWithData(
        "Session restore request accepted",
        {
          dataToSend,
        }
      );

      res.status(200).json(response);
    });
  }

  public async googleOAuth(
    req: Request<{}, {}, {}, { code: string }>,
    res: Response
  ): Promise<void> {
    return handleError(req, res, async () => {
      const { code } = req.query;

      const userData = await authHandler.handleGoogleOAuth(code);
      const response = prepareResponseWithData(
        "Login request accepted",
        userData
      );

      res.status(200).json(response);
    });
  }

  public async restorePassword(
    req: Request<{}, {}, { email: string }>,
    res: Response
  ) {
    const { email } = req.body;
    return handleError(req, res, async () => {
      await authHandler.handleRestorePassword(email);
      const response = prepareResponse(
        "An email with the vertification code was sent to the email."
      );

      res.status(200).json(response);
    });
  }

  public async createNewPasswordAfterRestore(
    req: Request<{}, {}, IAuthorizationRequestWithCode>,
    res: Response
  ) {
    const { email, code, password } = req.body;
    return handleError(req, res, async () => {
      await authHandler.handleCreatingNewPassword(email, code, password);
      const response = prepareResponse(
        "New password saved. You can now use it, to login."
      );

      res.status(200).json(response);
    });
  }

  public async registerUser(
    req: Request<{}, {}, IAuthorizationRequest>,
    res: Response
  ): Promise<void> {
    const { email, password } = req.body;
    return handleError(req, res, async () => {
      await authHandler.handleRegisterUser(email, password);
      const responseObject: IResponseMsg = prepareResponse(
        "User has been registered"
      );
      res.status(201).json(responseObject);
    });
  }

  public async vertifyUser(
    req: Request<{}, {}, IAuthorizationRequestWithCode>,
    res: Response
  ): Promise<void> {
    const { code, email, password } = req.body;
    return handleError(req, res, async () => {
      const dataToSend = await authHandler.handleEmailConfirmation(
        code,
        email,
        password
      );
      const responseObject: IResponseMsg = prepareResponseWithData(
        "User succesfully vertificated his email",
        dataToSend
      );
      return res.status(201).json(responseObject);
    });
  }

  public async deleteUserByHimself(req: Request<{}, {}, {}>, res: Response) {
    return handleError(req, res, async () => {
      const userId: string = req["userId"];
      await authHandler.handleDeletingUser(userId);

      const responseObject: IResponseMsg = prepareResponse(
        "User succesfully deleted"
      );
      return res.status(200).json(responseObject);
    });
  }

  public async deleteAllUsers(req: Request, res: Response) {
    return handleError(req, res, async () => {
      await authHandler.handleDeletingAllUsers();

      res.status(200).send();
    });
  }

  public failedRequest(req: Request, res: Response): void {
    const responseObject: IResponseMsg = prepareResponse(
      "Error",
      "Problem with authorization"
    );
    res.status(401).json(responseObject);
  }
}

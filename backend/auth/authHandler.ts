import UserModel, { IUser } from "../Database/Models/user.model";
import { IUserDataForFrontend } from "../types/UserLogic.types";
import awsCognitoHandler from "./utills/awsCognitoHandler";
import nodeFetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

export interface IDataWithTokenAndUserData {
  userData: IUserDataForFrontend;
  token: string;
}

export class AuthHandler {
  private awsCognitoHandler = new awsCognitoHandler();

  public handleGeneratingTokenAndUserData(
    email: string,
    password: string
  ): Promise<IDataWithTokenAndUserData> {
    return this.awsCognitoHandler
      .signIn(email, password)
      .then((authToken: string) => {
        return UserModel.getUserData(email).then((userData) => {
          const result: IDataWithTokenAndUserData = {
            userData,
            token: authToken,
          };
          return result;
        });
      });
  }

  public async handleRestoreSessionData(email: string, userId: string) {
    try {
      const user: IUser = await UserModel.findOne({ email: email });
      if (user._id.toString() != userId.toString()) {
        throw Error("Invalid token for user with given email");
      }

      return await UserModel.getUserData(email);
    } catch (err) {
      throw err;
    }
  }

  public async handleRestorePassword(email: string) {
    try {
      const user = await UserModel.findOne({ email: email });
      if (!user) {
        throw Error("User with given email address is not exist!");
      }
      await this.awsCognitoHandler.restorePassword(email);
    } catch (err) {
      throw err;
    }
  }
  public handleCreatingNewPassword(
    email: string,
    code: string,
    password: string
  ) {
    return this.awsCognitoHandler.createNewPassword(email, code, password);
  }
  public async handleRegisterUser(email: string, password: string) {
    try {
      const user = await UserModel.findOne({ email: email });
      if (user) {
        throw Error("User with given email address is already registered!");
      }
      await this.awsCognitoHandler.signUp(email, password);
    } catch (err) {
      throw err;
    }
  }

  public async handleEmailConfirmation(
    code: string,
    email: string,
    password: string
  ): Promise<IDataWithTokenAndUserData> {
    try {
      await this.awsCognitoHandler.verify(email, code);
      const authToken = await this.awsCognitoHandler.signIn(email, password);
      const userData = await UserModel.getUserData(email);
      return { token: authToken, userData };
    } catch (err) {
      throw err;
    }
  }

  public async handleGoogleOAuth(
    code: string
  ): Promise<IDataWithTokenAndUserData> {
    try {
      const rawResult = await nodeFetch(
        process.env.AWS_COGNITO_URL_DOMAIN + "/oauth2/token",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
          },
          body: new URLSearchParams({
            grant_type: "authorization_code",
            client_id: process.env.AWS_COGNITO_CLIENT_ID,
            code: code,
            redirect_uri: process.env.AWS_REDIRECT_URL,
          }),
        }
      );
      const { id_token } = await rawResult.json();

      const userData = await this.awsCognitoHandler.handleOAuth(id_token);
      return { token: id_token, userData: userData };
    } catch (err) {
      throw err;
    }
  }

  public async handleDeletingUser(userId: string) {
    try {
      const { email } = await UserModel.deleteUser(userId);
      await this.awsCognitoHandler.deleteUser(email);
    } catch (err) {
      throw err;
    }
  }

  public async handleDeletingAllUsers() {
    try {
      const userList: Array<IUser> = await UserModel.find();
      for (const user of userList) {
        await this.awsCognitoHandler.deleteUser(user.email);
      }

      await UserModel.deleteMany();
    } catch (err) {
      throw err;
    }
  }
}

const resource = new AuthHandler();

export default resource;

import AWS, { CognitoIdentityCredentials } from "aws-sdk";
import {
  CognitoUserPool,
  CognitoUserAttribute,
  AuthenticationDetails,
  CognitoUser,
  ISignUpResult,
} from "amazon-cognito-identity-js";

import dotenv from "dotenv";
import UserModel from "../../Database/Models/user.model";
import { cognitoExpress } from "../../middlewares/tokenValidator";
import { IUserDataForFrontend } from "../../types/UserLogic.types";

dotenv.config();

export default class AmazonCognitoHandler {
  private poolData = {
    UserPoolId: process.env.AWS_COGNITO_USER_POOL_ID,
    ClientId: process.env.AWS_COGNITO_CLIENT_ID,
  };
  private pool_region: string = process.env.AWS_COGNITO_REGION;
  private userPool = new CognitoUserPool(this.poolData);
  constructor() {
    this.initAWS();
  }

  public handleOAuth(id_token: string): Promise<IUserDataForFrontend> {
    return new Promise((resolve, reject) => {
      cognitoExpress.validate(id_token, async (err, response) => {
        if (err) reject("Invalid token");
        const { email } = response;
        try {
          const user = await UserModel.findOne({ email: email });
          if (!user) {
            await UserModel.createUser(email);
          }
          const userData = await UserModel.getUserData(email);
          resolve(userData);
        } catch (error) {
          reject(error);
        }
      });
    });
  }

  public signUp(email: string, password: string) {
    return new Promise((resolve, reject) => {
      const attributeList = [];

      const emailData = new CognitoUserAttribute({
        Name: "email",
        Value: email,
      });

      attributeList.push(emailData);

      this.userPool.signUp(
        email,
        password,
        attributeList,
        null,
        async (err: Error, result?: ISignUpResult) => {
          if (err) {
            return reject(Error(err.message));
          }
          await UserModel.createUser(email);
          return resolve({ statusCode: 201, response: "User created" });
        }
      );
    });
  }

  public verify(email: string, code: string) {
    return new Promise((resolve, reject) => {
      const userData = {
        Username: email,
        Pool: this.userPool,
      };
      const cognitoUser = new CognitoUser(userData);
      cognitoUser.confirmRegistration(code, true, (err, result) => {
        if (err) {
          return reject(Error(err.message));
        }
        return resolve({ statusCode: 400, response: result });
      });
    });
  }

  public signIn(email: string, password: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const userData = this.getCognitoUser(email);
      const authenticationDetails = this.getAuthDetails(email, password);
      userData.authenticateUser(authenticationDetails, {
        onSuccess: (result) => {
          const token = result.getIdToken().getJwtToken();

          return resolve(token);
        },
        onFailure: (err) => {
          return reject(err);
        },
      });
    });
  }

  public async deleteUser(email: string) {
    const cognito = new AWS.CognitoIdentityServiceProvider();

    return await new Promise((resolve, reject) => {
      const params = {
        UserPoolId: process.env.AWS_COGNITO_USER_POOL_ID,
        Username: email,
      };

      cognito.adminDeleteUser(params, (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
  }

  public async restorePassword(email: string) {
    const cognitoUser = this.getCognitoUser(email);
    return new Promise((resolve, reject) => {
      cognitoUser.forgotPassword({
        onSuccess: (result) => {
          return resolve(result);
        },
        onFailure: (err) => {
          return reject(err);
        },
      });
    });
  }

  public async createNewPassword(
    email: string,
    verificationCode: string,
    newPassword: string
  ) {
    const cognitoUser = this.getCognitoUser(email);

    return new Promise((resolve, reject) => {
      cognitoUser.confirmPassword(verificationCode, newPassword, {
        onSuccess: () => {
          resolve("Ok");
        },
        onFailure: (err) => {
          reject(err);
        },
      });
    });
  }

  public async confirmUser(email: string) {
    const cognito = new AWS.CognitoIdentityServiceProvider();
    const params = {
      UserPoolId: process.env.AWS_COGNITO_USER_POOL_ID,
      Username: email,
    };
    return await new Promise((resolve, reject) => {
      cognito.adminConfirmSignUp(params, (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
  }

  private initAWS() {
    AWS.config.region = this.pool_region;
    AWS.config.credentials = new CognitoIdentityCredentials({
      IdentityPoolId: process.env.AWS_COGNITO_IDENTITY_POOL_ID,
    });
    AWS.config.update({
      accessKeyId: process.env.AWS_SECRET_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_KEY,
      region: this.pool_region,
    });
  }

  private getCognitoUser(email: string) {
    const userData = {
      Username: email,
      Pool: this.userPool,
    };
    return new CognitoUser(userData);
  }

  private getAuthDetails(email: string, password: string) {
    const authenticationData = {
      Username: email,
      Password: password,
    };
    return new AuthenticationDetails(authenticationData);
  }
}

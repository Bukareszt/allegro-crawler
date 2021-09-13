import request from "supertest";
import { Express } from "express";
import awsCognitoHandler from "../../auth/utills/awsCognitoHandler";
import UserModel from "../../Database/Models/user.model";
import dotenv from "dotenv";

dotenv.config();

const testRequestBodyForCreatingUser = {
  email: process.env.EMAIL_LOGIN,
  password: "Kotek123@",
};
export const createUserForTestAndGetToken = async (app: Express) => {
  try {
    const response = await request(app)
      .put("/auth/api/v1/register")
      .send(testRequestBodyForCreatingUser)
      .set("Accept", "application/json");

    await awsCognitoHandler.confirmUser(testRequestBodyForCreatingUser.email);
    await UserModel.findOneAndUpdate(
      { email: testRequestBodyForCreatingUser.email },
      {
        subscriptionAccountInformation: {
          haveSubscription: true,
          stripeCustomerId: "random ID LMAO",
        },
      }
    );

    const responseWithToken = await request(app)
      .post("/auth/api/v1/login")
      .send(testRequestBodyForCreatingUser)
      .set("Accept", "application/json");

    const { data } = responseWithToken.body;

    return data.token;
  } catch (err) {
    throw err;
  }
};

export const deleteTestUser = async (app: Express, userToken: string) => {
  try {
    const response = await request(app)
      .delete("/auth/api/v1/")
      .set("Authorization", userToken)
      .set("Accept", "application/json");
  } catch (err) {
    throw err;
  }
};

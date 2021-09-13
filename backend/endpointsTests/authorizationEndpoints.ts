import app from "../src/app";
import request from "supertest";
import env from "dotenv";
import { IResponseMsg } from "../types/Controllers.types";
import prepareResponse from "../utills/Response/prepareResponse";
import awsCognitoHandler from "../auth/utills/awsCognitoHandler";

env.config();

const crawlerAuthorizationEndpointsTests = () =>
  describe("Authorization endpoints: ", () => {
    const requestBody = {
      email: process.env.EMAIL_LOGIN,
      password: "Kotek123@",
    };

    describe("- register", () => {
      it("works properly while, user try to register with password which does not meet the security requirements", async () => {
        const arrrOfInvalidRequests = [
          {
            email: "ada",
            password: "Kotek123",
          },
          {
            email: process.env.EMAIL_LOGIN,
            password: "Kotek123",
          },

          {
            email: process.env.EMAIL_LOGIN,
            password: "Kotek",
          },
          {
            email: process.env.EMAIL_LOGIN,
            password: "kotek123@",
          },
          {
            email: process.env.EMAIL_LOGIN,
            password: "KOTEK123@",
          },
        ];

        for (const invalidRequest of arrrOfInvalidRequests) {
          const response = await request(app)
            .put("/auth/api/v1/register")
            .send(invalidRequest)
            .set("Accept", "application/json");
          expect(response.status).toBe(400);
        }
      });

      it("works properly while, user try to register with valid data", async () => {
        const responseObject: IResponseMsg = prepareResponse(
          "User has been registered"
        );

        const response = await request(app)
          .put("/auth/api/v1/register")
          .set("Accept", "application/json")
          .send(requestBody);

        console.log(response.body);

        expect(response.status).toBe(201);
        expect(response.body).toEqual(responseObject);
      });

      it("works properly while, user try to register with email whitch already exist in DB", async () => {
        const responseObject: IResponseMsg = prepareResponse(
          "Bad request! Check error message!",
          "User with given email address is already registered!"
        );

        const response = await request(app)
          .put("/auth/api/v1/register")
          .send(requestBody)
          .set("Accept", "application/json");

        expect(response.status).toBe(400);
        expect(response.body).toEqual(responseObject);
      });
    });

    describe("- login", () => {
      it("works properly when user try to login with valid data", async () => {
        await awsCognitoHandler.confirmUser(requestBody.email);
        const response = await request(app)
          .post("/auth/api/v1/login")
          .send(requestBody)
          .set("Accept", "application/json");

        expect(response.status).toBe(200);
      });

      it("works properly while, user try to register with password which does not meet the security requirements", async () => {
        const arrrOfInvalidRequests = [
          {
            email: "ada",
            password: "Kotek123",
          },
          {
            email: "dwadw",
            password: "Kotek123",
          },

          {
            email: process.env.EMAIL_LOGIN,
            password: "Kotek",
          },
          {
            email: process.env.EMAIL_LOGIN,
            password: "kotek123@",
          },
          {
            email: process.env.EMAIL_LOGIN,
            password: "KOTEK123@",
          },
        ];

        for (const invalidRequest of arrrOfInvalidRequests) {
          const response = await request(app)
            .post("/auth/api/v1/login")
            .send(invalidRequest)
            .set("Accept", "application/json");
          expect(response.status).toBe(400);
        }
      });
    });

    describe("- user actions", () => {
      const requestBody = {
        email: process.env.EMAIL_LOGIN,
        password: "Kotek123@",
      };
      it("user can delete properly his account", async () => {
        const responseWithUserToken = await request(app)
          .post("/auth/api/v1/login")
          .send(requestBody)
          .set("Accept", "application/json");
        const { data } = responseWithUserToken.body;
        const response = await request(app)
          .delete("/auth/api/v1/")
          .set("Authorization", data.token)
          .set("Accept", "application/json");

        expect(response.status).toBe(200);
      });
    });
  });

export default crawlerAuthorizationEndpointsTests;

import request from "supertest";
import app from "../src/app";
import DailyCrawlingModel, {
  IDailyCrawling,
} from "../Database/Models/dailyCrawling.model";
import UserModel from "../Database/Models/user.model";

import { IResponseMsg } from "../types/Controllers.types";
import { SortOptions } from "../types/Crawler.types";
import { IRequestToCreateDailyCrawling } from "../types/DailyCrawling.types";
import prepareResponse from "../utills/Response/prepareResponse";
import { createUserForTestAndGetToken, deleteTestUser } from "./utills/login";
import dotenv from "dotenv";
dotenv.config();

const requestBodyToCreateValidDailyCrawling: IRequestToCreateDailyCrawling = {
  crawlerArguments: {
    category: "kitko",
    countOfProductsToCheck: 100,
    sellersLogins: [],
    saveFile: false,
    deepSearch: false,
    sortBy: SortOptions.priceAscending,
    nameOfCrawler: "tester",
  },
  timeArguments: {
    hourOfCrawling: 21,
    minuteOfCrawling: 27,
  },
};

const dailyCrawlingEndpointsTests = () => {
  describe("DailyCrawling endpoints: ", () => {
    let token;
    let userId;
    beforeAll(async () => {
      token = await createUserForTestAndGetToken(app);
      const user = await UserModel.findOne({ email: process.env.EMAIL_LOGIN });
      userId = user._id;
    });
    afterAll(async () => {
      await deleteTestUser(app, token);
    });

    describe(" - create", () => {
      it("works properly with valid data", async () => {
        const responseObject: IResponseMsg = prepareResponse(
          "Daily Crawling was saved in database, and will start on time."
        );

        const response = await request(app)
          .put("/dailyCrawling/api/v1")
          .set("Authorization", token)
          .send(requestBodyToCreateValidDailyCrawling)
          .set("Accept", "application/json");

        expect(response.status).toBe(201);
        expect(response.body).toEqual(responseObject);
      });
      it("works properly with no authorized request", async () => {
        const responseObject: IResponseMsg = prepareResponse(
          "Bad request! Check error message!",
          "Access Token missing from header"
        );
        const response = await request(app)
          .put("/dailyCrawling/api/v1")
          .set("Accept", "application/json");

        expect(response.status).toBe(401);
        expect(response.body).toEqual(responseObject);
      });
      it("works properly with invalid data", async () => {
        const arrOfinvalidRequestBody = [
          {
            crawlerArguments: {
              category: "",
              countOfProductsToCheck: -1100,
              sortBy: SortOptions.popularityDescending,
              deepSearch: false,
              sellersLogins: [],
              saveFile: false,
              nameOfCrawler: "Tester",
            },
          },
          {
            crawlerArguments: {
              category: "1e214tgvczsWEDF",
              countOfProductsTFoCheck: 1001221100,
              sortBy: "KTAIWEDX",
              deepSearch: null,
              sellersLogins: [],
              saveFile: null,
              nameOfCrawler: "Tester",
            },
            timeArguments: {
              hourOfCrawling: 26,
              minuteOfCrawling: 61,
            },
          },
          {
            crawlerArguments: {
              category: "Kitko",
              countOfProductsToCheck: 1100,
              sortBy: SortOptions.popularityDescending,
              deepSearch: true,
              sellersLogins: null,
              saveFile: null,
              nameOfCrawler: "Tester",
            },
            timeArguments: {
              hourOfCrawling: 21,
              minuteOfCrawling: 32,
            },
          },
        ];

        for (const invalidRequest of arrOfinvalidRequestBody) {
          const response = await request(app)
            .put("/dailyCrawling/api/v1")
            .set("Authorization", token)
            .send(invalidRequest)
            .set("Accept", "application/json");

          expect(response.status).toBe(400);
        }
      });
    });

    describe(" - edit", () => {
      let _idOfResource;
      beforeAll(async () => {
        const dailyCrawlerSavedInDb: IDailyCrawling = await DailyCrawlingModel.findOne(
          { owner: userId }
        );

        _idOfResource = dailyCrawlerSavedInDb._id;
      });

      it("works properly with no authorized request", async () => {
        const responseObject: IResponseMsg = prepareResponse(
          "Bad request! Check error message!",
          "Access Token missing from header"
        );
        const response = await request(app)
          .put("/dailyCrawling/api/v1/" + _idOfResource)
          .set("Accept", "application/json");

        expect(response.status).toBe(401);
        expect(response.body).toEqual(responseObject);
      });
      it("works properly with invalid data", async () => {
        const arrOfinvalidRequestBody = [
          {
            crawlerArguments: {
              category: "",
              countOfProductsToCheck: -1100,
              sortBy: SortOptions.popularityDescending,
              deepSearch: false,
              sellersLogins: [],
              saveFile: false,
              nameOfCrawler: "Tester",
            },
          },
          {
            crawlerArguments: {
              category: "1e214tgvczsWEDF",
              countOfProductsTFoCheck: 1001221100,
              sortBy: "KTAIWEDX",
              deepSearch: null,
              sellersLogins: [],
              saveFile: null,
              nameOfCrawler: "Tester",
            },
            timeArguments: {
              hourOfCrawling: 26,
              minuteOfCrawling: 61,
            },
          },
          {
            crawlerArguments: {
              category: "Kitko",
              countOfProductsToCheck: 1100,
              sortBy: SortOptions.popularityDescending,
              deepSearch: true,
              sellersLogins: null,
              saveFile: null,
              nameOfCrawler: "Tester",
            },
            timeArguments: {
              hourOfCrawling: 21,
              minuteOfCrawling: 32,
            },
          },
        ];

        for (const invalidRequest of arrOfinvalidRequestBody) {
          const response = await request(app)
            .put("/dailyCrawling/api/v1/" + _idOfResource)
            .set("Authorization", token)
            .send(invalidRequest)
            .set("Accept", "application/json");

          expect(response.status).toBe(400);
        }
      });
      it("works properly with valid data", async () => {
        const requestBody: IRequestToCreateDailyCrawling = {
          crawlerArguments: {
            category: "kitkoMRUCZY!",
            countOfProductsToCheck: 100,
            sellersLogins: [],
            saveFile: false,
            deepSearch: false,
            sortBy: SortOptions.priceAscending,
            nameOfCrawler: "tester",
          },
          timeArguments: {
            hourOfCrawling: 21,
            minuteOfCrawling: 27,
          },
        };

        const responseObject: IResponseMsg = prepareResponse(
          "Daily Crawling was updated ."
        );
        const response = await request(app)
          .put("/dailyCrawling/api/v1/" + _idOfResource)
          .set("Authorization", token)
          .send(requestBody)
          .set("Accept", "application/json");

        expect(response.status).toBe(200);
        expect(response.body).toEqual(responseObject);
      });
    });

    describe(" - stop", () => {
      let _idOfResource;

      beforeAll(async () => {
        const dailyCrawlerSavedInDb: IDailyCrawling = await DailyCrawlingModel.findOne(
          { owner: userId }
        );

        _idOfResource = dailyCrawlerSavedInDb._id;
      });

      it("works properly with no authorized requests", async () => {
        const responseObject: IResponseMsg = prepareResponse(
          "Bad request! Check error message!",
          "Access Token missing from header"
        );
        const response = await request(app)
          .post("/dailyCrawling/api/v1/stop/" + _idOfResource)
          .set("Accept", "application/json");

        expect(response.status).toBe(401);
        expect(response.body).toEqual(responseObject);
      });
      it("works properly with authorized requests", async () => {
        const responseObject: IResponseMsg = prepareResponse(
          "Daily crawling with given id was stopped!."
        );
        const response = await request(app)
          .post("/dailyCrawling/api/v1/stop/" + _idOfResource)
          .set("Authorization", token)
          .set("Accept", "application/json");

        expect(response.status).toBe(200);
        expect(response.body).toEqual(responseObject);
      });
    });

    describe(" - start", () => {
      let _idOfResource;
      beforeAll(async () => {
        const dailyCrawlerSavedInDb: IDailyCrawling = await DailyCrawlingModel.findOne(
          { owner: userId }
        );

        _idOfResource = dailyCrawlerSavedInDb._id;
      });
      it("works properly with no authorized requests", async () => {
        const responseObject: IResponseMsg = prepareResponse(
          "Bad request! Check error message!",
          "Access Token missing from header"
        );
        const response = await request(app)
          .post("/dailyCrawling/api/v1/start/" + _idOfResource)
          .set("Accept", "application/json");

        expect(response.status).toBe(401);
        expect(response.body).toEqual(responseObject);
      });
      it("works properly with authorized requests", async () => {
        const responseObject: IResponseMsg = prepareResponse(
          "Daily crawling with given id was started!."
        );
        const response = await request(app)
          .post("/dailyCrawling/api/v1/start/" + _idOfResource)
          .set("Authorization", token)
          .set("Accept", "application/json");

        expect(response.status).toBe(200);
        expect(response.body).toEqual(responseObject);
      });
    });
    describe("- delete", () => {
      let _idOfResource;
      beforeAll(async () => {
        const dailyCrawlerSavedInDb: IDailyCrawling = await DailyCrawlingModel.findOne(
          { owner: userId }
        );

        _idOfResource = dailyCrawlerSavedInDb._id;
      });
      it("works properly with authorized requests", async () => {
        const responseObject: IResponseMsg = prepareResponse(
          "Daily Crawling with givenId was deleted!"
        );
        const response = await request(app)
          .delete("/dailyCrawling/api/v1/" + _idOfResource)
          .set("Authorization", token)
          .set("Accept", "application/json");
        expect(response.status).toBe(200);
        expect(response.body).toEqual(responseObject);
      });
      it("works properly with no authorized requests", async () => {
        const responseObject: IResponseMsg = prepareResponse(
          "Bad request! Check error message!",
          "Access Token missing from header"
        );
        const response = await request(app)
          .delete("/dailyCrawling/api/v1/" + _idOfResource)
          .set("Accept", "application/json");

        expect(response.status).toBe(401);
        expect(response.body).toEqual(responseObject);
      });
    });
  });
};

export default dailyCrawlingEndpointsTests;

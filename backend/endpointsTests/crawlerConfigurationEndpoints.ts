import request from "supertest";
import env from "dotenv";

import {
  ICrawlerRequestWithCrawlerName,
  SortOptions,
} from "../types/Crawler.types";
import app from "../src/app";
import { IResponseMsg } from "../types/Controllers.types";
import prepareResponse from "../utills/Response/prepareResponse";
import { createUserForTestAndGetToken, deleteTestUser } from "./utills/login";
import CrawlingConfigurationModel from "../Database/Models/crawlingConfiguration.model";

env.config();
const crawlerConfigruationEndpointsTests = () => {
  let token;

  describe("Crawler configuration endpoints: ", () => {
    beforeAll(async () => {
      token = await createUserForTestAndGetToken(app);
    });
    afterAll(async () => {
      await deleteTestUser(app, token);
    });

    describe("- create", () => {
      const requestBody: ICrawlerRequestWithCrawlerName = {
        crawlerArguments: {
          category: "Lego star wars xbox",
          countOfProductsToCheck: 100,
          sortBy: SortOptions.popularityDescending,
          deepSearch: false,
          sellersLogins: [],
          saveFile: true,
          nameOfCrawler: "TESTER!",
        },
      };

      it("works properly whitch bad request body", async () => {
        const arrOfinvalidRequestBody = [
          {
            crawlerArguments: {
              category: "",
              countOfProductsToCheck: -1100,
              sortBy: SortOptions.popularityDescending,
              deepSearch: false,
              sellersLogins: [],
              saveFile: true,
              nameOfCrawler: "",
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
              nameOfCrawler: "",
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
              nameOfCrawler: null,
            },
          },
        ];

        for (const invalidRequest of arrOfinvalidRequestBody) {
          const response = await request(app)
            .put("/crawlerConfig/api/v1")
            .set("Authorization", token)
            .send(invalidRequest)
            .set("Accept", "application/json");

          expect(response.status).toBe(400);
        }
      });

      it("works properly whitch not authorized request", async () => {
        const responseObject: IResponseMsg = prepareResponse(
          "Bad request! Check error message!",
          "Access Token missing from header"
        );
        const response = await request(app)
          .put("/crawlerConfig/api/v1")
          .send(requestBody)
          .set("Accept", "application/json");

        expect(response.status).toBe(401);
        expect(response.body).toEqual(responseObject);
      });

      it("works properly whitch authorized request", async () => {
        const response = await request(app)
          .put("/crawlerConfig/api/v1")
          .set("Authorization", token)
          .send(requestBody)
          .set("Accept", "application/json");
        const responseObject: IResponseMsg = prepareResponse(
          "Crawler configuration was saved!"
        );
        expect(response.status).toBe(200);
      });
    });

    describe(" - edit", () => {
      const requestBody: ICrawlerRequestWithCrawlerName = {
        crawlerArguments: {
          category: "Lego star wars xbox",
          countOfProductsToCheck: 1000,
          sortBy: SortOptions.priceAscending,
          deepSearch: false,
          sellersLogins: [],
          saveFile: true,
          nameOfCrawler: "TESTER!",
        },
      };
      let crawlingId;
      beforeAll(async () => {
        const { _id } = await CrawlingConfigurationModel.findOne({
          nameOfCrawler: "TESTER!",
        });
        crawlingId = _id;
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
              saveFile: true,
              nameOfCrawler: "",
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
              nameOfCrawler: "",
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
              nameOfCrawler: null,
            },
          },
        ];
        const { _id } = await CrawlingConfigurationModel.find({
          nameOfCrawler: "TESTER!",
        });

        for (const invalidRequest of arrOfinvalidRequestBody) {
          const response = await request(app)
            .put("/crawlerConfig/api/v1/" + _id)
            .set("Authorization", token)
            .send(invalidRequest)
            .set("Accept", "application/json");

          expect(response.status).toEqual(400);
        }
      });

      it("works properly with not authorized request", async () => {
        const responseObject: IResponseMsg = prepareResponse(
          "Bad request! Check error message!",
          "Access Token missing from header"
        );
        const { _id } = await CrawlingConfigurationModel.find({
          nameOfCrawler: "TESTER!",
        });

        const response = await request(app)
          .put("/crawlerConfig/api/v1/" + _id)
          .send(requestBody)
          .set("Accept", "application/json");

        expect(response.status).toBe(401);
        expect(response.body).toEqual(responseObject);
      });

      it("works properly with valid data", async () => {
        const responseObject: IResponseMsg = prepareResponse(
          "New crawler configuration was saved!"
        );

        const response = await request(app)
          .put("/crawlerConfig/api/v1/" + crawlingId)
          .set("Authorization", token)
          .send(requestBody)
          .set("Accept", "application/json");
        console.log(response.body);
        expect(response.status).toBe(200);
        expect(response.body).toEqual(responseObject);
      });
    });

    describe(" - use Saved Configuration", () => {
      let crawlingId;
      beforeAll(async () => {
        const { _id } = await CrawlingConfigurationModel.findOne({
          nameOfCrawler: "TESTER!",
        });
        crawlingId = _id;
      });
      it("works properly whitch not authorized request", async () => {
        const responseObject: IResponseMsg = prepareResponse(
          "Bad request! Check error message!",
          "Access Token missing from header"
        );
        const response = await request(app)
          .post("/crawlerConfig/api/v1/" + crawlingId)
          .set("Accept", "application/json");

        expect(response.status).toBe(401);
        expect(response.body).toEqual(responseObject);
      });

      it("works properly while user try to use his owne resource", async () => {
        const responseObject: IResponseMsg = prepareResponse(
          "Crawling has started! When everything will be ready, we will send you an email with data."
        );
        const response = await request(app)
          .post("/crawlerConfig/api/v1/" + crawlingId)
          .set("Authorization", token)
          .set("Accept", "application/json");

        expect(response.status).toEqual(202);
        expect(response.body).toEqual(responseObject);
      });
    });

    describe(" - delete", async () => {
      let crawlingId;
      beforeAll(async () => {
        const { _id } = await CrawlingConfigurationModel.findOne({
          nameOfCrawler: "TESTER!",
        });
        crawlingId = _id;
      });

      it("works properly while user delete his owne resource", async () => {
        const responseObject: IResponseMsg = prepareResponse(
          "Crawler configuration was deleted!"
        );
        const response = await request(app)
          .delete("/crawlerConfig/api/v1/" + crawlingId)
          .set("Authorization", token)
          .set("Accept", "application/json");

        expect(response.status).toEqual(200);
        expect(response.body).toEqual(responseObject);
      });
    });

    describe(" - deleteAll", async () => {
      beforeAll(async () => {
        const requestBodyArr = [
          {
            crawlerArguments: {
              category: "Lego star wars xbox",
              countOfProductsToCheck: 100,
              sortBy: SortOptions.popularityDescending,
              deepSearch: false,
              sellersLogins: [],
              saveFile: true,
              nameOfCrawler: "TESTER!",
            },
          },
          {
            crawlerArguments: {
              category: "Lego star wars xbox",
              countOfProductsToCheck: 100,
              sortBy: SortOptions.popularityDescending,
              deepSearch: false,
              sellersLogins: [],
              saveFile: true,
              nameOfCrawler: "TESTER!",
            },
          },
        ];
        for (const requestBody of requestBodyArr) {
          await request(app)
            .put("/crawlerConfig/api/v1")
            .set("Authorization", token)
            .send(requestBody)
            .set("Accept", "application/json");
        }
      });

      it("works properly, while user try to delete his owne resources", async () => {
        const responseObject: IResponseMsg = prepareResponse(
          "All crawler configuration for given user was deleted!"
        );
        const response = await request(app)
          .delete("/crawlerConfig/api/v1/list")
          .set("Authorization", token)
          .set("Accept", "application/json");

        expect(response.status).toEqual(200);
        expect(response.body).toEqual(responseObject);
      });
    });
  });
};

export default crawlerConfigruationEndpointsTests;

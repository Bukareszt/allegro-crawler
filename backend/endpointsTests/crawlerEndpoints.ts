import app from "../src/app";
import { IResponseMsg } from "../types/Controllers.types";
import { ICrawlerRequest, SortOptions } from "../types/Crawler.types";
import prepareResponse from "../utills/Response/prepareResponse";
import { createUserForTestAndGetToken, deleteTestUser } from "./utills/login";
import request from "supertest";

const crawlerEndpointsTests = () => {
  describe("Crawler endpoints: ", () => {
    let token;
    beforeAll(async () => {
      token = await createUserForTestAndGetToken(app);
    });
    afterAll(async () => {
      await deleteTestUser(app, token);
    });

    describe("crawlAllegro", () => {
      it("works properly with no authorized request", async () => {
        const responseObject: IResponseMsg = prepareResponse(
          "Bad request! Check error message!",
          "Access Token missing from header"
        );
        const response = await request(app)
          .post("/crawler/api/v1")
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
            },
          },
        ];
        const responseObject: IResponseMsg = prepareResponse(
          "Crawling has started! When everything will be ready, we will send you an email with data."
        );
        for (const invalidRequest of arrOfinvalidRequestBody) {
          const response = await request(app)
            .post("/crawler/api/v1")
            .set("Authorization", token)
            .send(invalidRequest)
            .set("Accept", "application/json");

          expect(response.status).toBe(400);
        }
      });
      it("works properly with valid data", async () => {
        const requestBody: ICrawlerRequest = {
          crawlerArguments: {
            category: "kitko",
            countOfProductsToCheck: 100,
            sellersLogins: [],
            saveFile: false,
            deepSearch: false,
            sortBy: SortOptions.priceAscending,
          },
        };

        const responseObject: IResponseMsg = prepareResponse(
          "Crawling has started! When everything will be ready, we will send you an email with data."
        );

        const response = await request(app)
          .post("/crawler/api/v1")
          .set("Authorization", token)
          .send(requestBody)
          .set("Accept", "application/json");

        expect(response.status).toBe(202);
        expect(response.body).toEqual(responseObject);
      });
    });
  });
};

export default crawlerEndpointsTests;

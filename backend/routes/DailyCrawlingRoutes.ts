import { Router } from "express";
import { checkIsUserWithSubscription } from "../middlewares/subscriptionValidator";
import DailyCrawlerController from "../controllers/dailyCrawlingController";

import tokenValidator from "../middlewares/tokenValidator";
import {
  dailyCrawlerArgumentsValidationRules,
  validate,
  validateSaveFileArgument,
} from "../middlewares/expressValidatorSetup";

class DailyCrawlerResource {
  public router: Router;
  private url: string;

  constructor(url: string = "/api/v1") {
    this.router = Router();
    this.url = url;
    this.router.use(tokenValidator, checkIsUserWithSubscription);
    this.buildRoutes();
  }

  private crawlerController = new DailyCrawlerController();

  private buildRoutes() {
    this.router.put(
      this.url + "/",
      dailyCrawlerArgumentsValidationRules(),
      validate,
      validateSaveFileArgument,
      this.crawlerController.createAndStartDailyCrawling
    );

    this.router.put(
      this.url + "/:id",
      dailyCrawlerArgumentsValidationRules(),
      validate,
      validateSaveFileArgument,
      this.crawlerController.editDailyCrawling
    );

    this.router.post(
      this.url + "/start/:id",
      this.crawlerController.startDailyCrawling
    );

    this.router.post(
      this.url + "/stop/:id",
      this.crawlerController.stopDailyCrawling
    );
    this.router.delete(
      this.url + "/list",
      this.crawlerController.deleteAllUserDailyCrawlings
    );

    this.router.delete(
      this.url + "/:id",
      this.crawlerController.deleteDailyCrawling
    );
  }
}

const resource = new DailyCrawlerResource();

export default resource;

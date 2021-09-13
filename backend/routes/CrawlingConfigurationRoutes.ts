import { Router } from "express";
import tokenValidator from "../middlewares/tokenValidator";

import CrawlerConfigurationController from "../controllers/crawlerConfigurationController";

import {
  crawlerArgumentsForConfigValidationRules,
  validate,
  validateSaveFileArgument,
} from "../middlewares/expressValidatorSetup";
import { checkIsUserWithSubscription } from "../middlewares/subscriptionValidator";

class CrawlerConfigurationResource {
  public router: Router;
  private url: string;

  constructor(url: string = "/api/v1") {
    this.router = Router();
    this.router.use(tokenValidator, checkIsUserWithSubscription);
    this.url = url;
    this.buildRoutes();
  }

  private configurationController = new CrawlerConfigurationController();

  private buildRoutes() {
    this.router.put(
      this.url + "/",
      crawlerArgumentsForConfigValidationRules(),
      validate,
      validateSaveFileArgument,
      this.configurationController.saveCrawlerConfiguration
    );
    this.router.put(
      this.url + "/:id",
      crawlerArgumentsForConfigValidationRules(),
      validate,
      validateSaveFileArgument,
      this.configurationController.editCrawlerConfiguration
    );

    this.router.delete(
      this.url + "/list",
      this.configurationController.deleteAllCrawlerConfigurationForGivenUser
    );

    this.router.delete(
      this.url + "/:id",
      this.configurationController.deleteCrawlerConfiguration
    );

    this.router.post(
      this.url + "/:id",
      this.configurationController.useSavedCrawlerConfiguration
    );
  }
}

const resource = new CrawlerConfigurationResource();

export default resource;

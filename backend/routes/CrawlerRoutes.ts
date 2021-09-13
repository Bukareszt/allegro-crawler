import { Router } from "express";
import CrawlerController from "../controllers/crawlerController";
import {
  crawlerArgumentsValidationRules,
  validate,
  validateSaveFileArgument,
} from "../middlewares/expressValidatorSetup";
import tokenValidator from "../middlewares/tokenValidator";

class CrawlerResource {
  public router: Router;
  private url: string;

  constructor(url: string = "/api/v1") {
    this.router = Router();
    this.url = url;
    this.router.use(tokenValidator);
    this.buildRoutes();
  }

  private crawlerController = new CrawlerController();

  private buildRoutes() {
    this.router.post(
      this.url + "/",
      crawlerArgumentsValidationRules(),
      validate,
      validateSaveFileArgument,
      this.crawlerController.crawlAllegro
    );
  }
}

const resource = new CrawlerResource();

export default resource;

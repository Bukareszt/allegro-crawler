import { Router } from "express";
import DataAnalysticController from "../controllers/dataAnalysticController";
import { checkIsUserWithSubscription } from "../middlewares/subscriptionValidator";
import tokenValidator from "../middlewares/tokenValidator";

class DataAnalysticResource {
  public router: Router;
  private url: string;
  private dataController = new DataAnalysticController();

  constructor(url: string = "/api/v1") {
    this.router = Router();
    this.url = url;
    this.router.use(tokenValidator, checkIsUserWithSubscription);
    this.buildRoutes();
  }

  private buildRoutes() {
    this.router.delete(this.url + "/:id", this.dataController.deleteDocument);
    this.router.put(
      this.url + "/",
      this.dataController.createNewAnalysDocument
    );
  }
}

const resource = new DataAnalysticResource();

export default resource;

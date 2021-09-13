import { Router } from "express";
import { checkIsUserWithSubscription } from "../middlewares/subscriptionValidator";

import tokenValidator from "../middlewares/tokenValidator";
import SavedFilesController from "../controllers/savedFilesController";

class SavedFilesResource {
  public router: Router;
  private url: string;

  constructor(url: string = "/api/v1") {
    this.router = Router();
    this.url = url;
    this.router.use(tokenValidator, checkIsUserWithSubscription);
    this.buildRoutes();
  }

  private savedFilesController = new SavedFilesController();

  private buildRoutes() {
    this.router.post(this.url + "/:id", this.savedFilesController.downloadFile);

    this.router.delete(
      this.url + "/list",
      this.savedFilesController.deleteAllFilesForGivenUser
    );

    this.router.delete(
      this.url + "/:id",
      this.savedFilesController.deleteFileForGivenUser
    );
  }
}

const resource = new SavedFilesResource();

export default resource;

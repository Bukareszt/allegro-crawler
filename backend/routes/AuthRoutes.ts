import { Router } from "express";
import AuthController from "../controllers/authController";
import {
  emailValidationRules,
  emailWithPasswordValidationRules,
  validate,
} from "../middlewares/expressValidatorSetup";
import tokenValidator from "../middlewares/tokenValidator";

class AuthResource {
  public router: Router;
  private url: string;
  private authController = new AuthController();

  constructor(url: string = "/api/v1") {
    this.router = Router();
    this.url = url;
    this.buildRoutes();
  }

  buildRoutes() {
    this.router.get(this.url + "/googleOAuth", this.authController.googleOAuth);
    this.router.put(
      this.url + "/register",
      emailWithPasswordValidationRules(),
      validate,
      this.authController.registerUser
    );

    this.router.post(
      this.url + "/login",
      emailWithPasswordValidationRules(),
      validate,
      this.authController.generateToken
    );

    this.router.post(
      this.url + "/session",
      tokenValidator,
      this.authController.getUserSessionData
    );

    this.router.post(
      this.url + "/restorePassword",
      emailValidationRules(),
      validate,
      this.authController.restorePassword
    );

    this.router.post(
      this.url + "/confirmNewPassword",
      emailWithPasswordValidationRules(),
      validate,
      this.authController.createNewPasswordAfterRestore
    );

    this.router.post(this.url + "/vertify", this.authController.vertifyUser);

    this.router.get(this.url + "/failed", this.authController.failedRequest);

    this.router.delete(this.url + "/list", this.authController.deleteAllUsers);

    this.router.delete(
      this.url + "/",
      tokenValidator,
      this.authController.deleteUserByHimself
    );
  }
}

const resource = new AuthResource();
export default resource;

import { Router } from "express";
import PaymentController from "../controllers/paymentController";

class PaymentResource {
  public router: Router;
  private url: string;

  constructor(url: string = "/api/v1") {
    this.router = Router();
    this.url = url;
    this.buildRoutes();
  }

  private paymentController = new PaymentController();

  private buildRoutes() {
    this.router.post(
      this.url + "/webhook",
      this.paymentController.stripeWebhooks
    );
    this.router.post(
      this.url + "/",
      this.paymentController.createCheckoutSession
    );
  }
}

const resource = new PaymentResource();

export default resource;

import StripeHandler from "../logic/business/subscription/StripeHandler";
import { Request, Response } from "express";
import dotenv from "dotenv";
import handleError from "./utills/errorHandler";

dotenv.config();

export default class PaymentController {
  public async createCheckoutSession(
    req: Request<{}, {}, { priceId: string }>,
    res: Response
  ) {
    const { priceId } = req.body;
    const userId: string = req["userId"];

    return handleError(req, res, async () => {
      const sessionId = await StripeHandler.createCheckoutSession(
        priceId,
        userId
      );

      return res.status(200).json({ sessionId: sessionId });
    });
  }

  public async stripeWebhooks(req: Request, res: Response) {
    const signature = req.headers["stripe-signature"];
    return handleError(req, res, async () => {
      if (!signature) {
        throw Error("Bad signature");
      }

      await StripeHandler.subscriptionWebhook(req.body, signature);
      return res.status(200).send();
    });
  }
}

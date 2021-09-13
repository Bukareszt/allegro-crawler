import Stripe from "stripe";
import dotenv from "dotenv";
import UserModel from "../../../Database/Models/user.model";
dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2020-08-27",
});

class StripeHandler {
  public async createCheckoutSession(priceId: string, userId: string) {
    try {
      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        payment_method_types: ["card"],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        success_url: "http://localhost:3000/howToUse",
        cancel_url: "http://localhost:3000/aboutMe",
        client_reference_id: userId,
      });

      return session.id;
    } catch (err) {
      throw err;
    }
  }

  public async subscriptionWebhook(
    requestBody: any,
    signature: string | Array<string>
  ) {
    try {
      const event = await this.createWebhook(requestBody, signature);
      const { data, type } = event;
      await this.decideWhatDoWithInformationFromEvent(type, data);
    } catch (err) {
      throw err;
    }
  }

  public async createWebhook(
    requestBody: any,
    signature: string | Array<string>
  ): Promise<Stripe.Event> {
    try {
      const event = await stripe.webhooks.constructEvent(
        requestBody,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );

      return event;
    } catch (err) {
      throw err;
    }
  }

  private async decideWhatDoWithInformationFromEvent(type: string, data: any) {
    try {
      if (type === "checkout.session.completed") {
        const { client_reference_id, customer } = data.object;
        await UserModel.addSubscriptionWithStripeCustomerId(
          client_reference_id,
          customer
        );
        return;
      }
      if (
        type === "invoice.payment_failed" ||
        type === "customer.subscription.deleted"
      ) {
        const { customer } = data.object;
        await UserModel.deleteSubscription(customer);

        return;
      }
    } catch (err) {
      throw err;
    }
  }
}

const resource = new StripeHandler();

export default resource;

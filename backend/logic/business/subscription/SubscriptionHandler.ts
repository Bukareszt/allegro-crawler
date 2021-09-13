import moment from "moment";
import UserModel from "../../../Database/Models/user.model";
import { ISubscriptionHandler } from "../../../types/UserLogic.types";

class SubscriptionHandler implements ISubscriptionHandler {
  private freeAmountOfCrawling: number = 100;

  public async validateLimitationOfCrawling(userId: string) {
    const currentMonth = moment().format("MMMM");

    const {
      amountOfCrawlingOverMonth,
      subscriptionAccountInformation,
    } = await UserModel.getUserDataForHandleCrawlingLimitation(userId);

    if (currentMonth !== amountOfCrawlingOverMonth.month) {
      await UserModel.changeMonthAndAmountOfCrawling(userId);
      return;
    }
    if (amountOfCrawlingOverMonth.amount < this.freeAmountOfCrawling) {
      return;
    }
    const subscriptionIsExpired = await UserModel.userHaveSubscription(userId);
    if (!subscriptionIsExpired) {
      throw Error(`This month's free use limit has been exhausted.`);
    }

    return;
  }
}

const resource = new SubscriptionHandler();

export default resource;

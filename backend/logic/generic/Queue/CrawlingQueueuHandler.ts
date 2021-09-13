import Queue from "bull";
import dotenv from "dotenv";
import UserModel from "../../../Database/Models/user.model";
import { ICrawlerArguments } from "../../../types/Crawler.types";
import {
  ICrawlerQueueuHandler,
  CrawlerQueueName,
  IObjectForQueue,
} from "../../../types/Queque.types";
import { ISubscriptionAccountData } from "../../../types/UserLogic.types";
import CrawlerHandler from "../crawler/CrawlerHandler";
dotenv.config();

class CrawlerQueueuHandler implements ICrawlerQueueuHandler {
  private quequeNames: Array<CrawlerQueueName> = [
    "noSubscriptionNotDeepSearch",
    "noSubscriprionWithDeepSearch",
    "SubscriptionNotDeepSearch",
    "SubscriprionWithDeepSearch",
  ];
  private queues = {};

  constructor() {
    this.quequeNames.forEach((name) => {
      this.addFunctionalityToQueueu(name);
    });
  }
  public async addToCrawlingQueue(
    userId: string,
    crawlerArguments: ICrawlerArguments
  ): Promise<void> {
    try {
      const {
        email,
        subscriptionAccountInformation,
      } = await UserModel.findById(userId);
      const objectForQueue = this.createObjectForQueue(
        userId,
        email,
        crawlerArguments
      );
      this.selectQueueForGivenRequest(
        objectForQueue,
        subscriptionAccountInformation
      );
    } catch (err) {
      throw err;
    }
  }
  private createObjectForQueue(
    userId: string,
    email: string,
    crawlerArguments: ICrawlerArguments
  ): IObjectForQueue {
    return { userId, email, crawlerArguments };
  }
  private selectQueueForGivenRequest(
    objectForQueue: IObjectForQueue,
    subscriptionData: ISubscriptionAccountData
  ) {
    let queue;
    const isPremiumAccount = subscriptionData.haveSubscription;

    if (isPremiumAccount && objectForQueue.crawlerArguments.deepSearch) {
      queue = this.getByName("SubscriprionWithDeepSearch");
      queue.add(objectForQueue);
      return;
    }
    if (isPremiumAccount) {
      queue = this.getByName("SubscriptionNotDeepSearch");
      queue.add(objectForQueue);
      return;
    }
    if (objectForQueue.crawlerArguments.deepSearch) {
      queue = this.getByName("noSubscriprionWithDeepSearch");
      queue.add(objectForQueue);
      return;
    }

    queue = this.getByName("noSubscriptionNotDeepSearch");
    queue.add(objectForQueue);
  }

  private addFunctionalityToQueueu(name: CrawlerQueueName) {
    let queue;
    if (process.env.DB_TYPE_ENV === "test") {
      queue = new Queue(name);
    } else {
      queue = new Queue(name, "redis://redisdb:6379");
    }
    queue.process(this.crawlerQueueRequest);
    this.queues[name] = queue;
  }
  private crawlerQueueRequest(dataForQueque) {
    const { userId, email, crawlerArguments } = dataForQueque.data;
    return CrawlerHandler.handleRequestToAllegro(
      crawlerArguments,
      email,
      userId
    );
  }
  private getByName(name: CrawlerQueueName) {
    return this.queues[name];
  }
}

const resource = new CrawlerQueueuHandler();
export default resource;

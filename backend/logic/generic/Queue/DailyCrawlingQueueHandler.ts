import Queue from "bull";
import dotenv from "dotenv";
import { IDailyCrawlingObject } from "../../../types/DailyCrawling.types";
import {
  IDailyCrawlingQueueuHandler,
  IObjectForDailyQueue,
} from "../../../types/Queque.types";
import CrawlerHandler from "../crawler/CrawlerHandler";
dotenv.config();

class DailyCrawlingQueueuHandler implements IDailyCrawlingQueueuHandler {
  private DailyQueue: Queue.Queue<any>;

  constructor() {
    if (process.env.DB_TYPE_ENV === "test") {
      this.DailyQueue = new Queue("dailyCrawling");
    } else {
      this.DailyQueue = new Queue("dailyCrawling", "redis://redisdb:6379");
    }
    this.DailyQueue.process(this.dailyQueueRequest);
  }
  public async addToDailyCrawlingQueueu(
    dailyCrawlingInstance: IDailyCrawlingObject
  ): Promise<void> {
    try {
      const objectForQueue = this.createObjectForDailyQueue(
        dailyCrawlingInstance
      );
      this.DailyQueue.add(objectForQueue);
    } catch (err) {
      throw err;
    }
  }
  private createObjectForDailyQueue(
    dailyCrawlingInstance: IDailyCrawlingObject
  ): IObjectForDailyQueue {
    const { email } = dailyCrawlingInstance;
    const {
      _id,
      owner,
      crawlerArguments,
    } = dailyCrawlingInstance.crawlingConfiguration;
    return {
      crawlingId: _id.toString(),
      email,
      crawlerArguments,
      ownerId: owner.toString(),
    };
  }
  private dailyQueueRequest(dataForQueque) {
    const { crawlingId, email, crawlerArguments, ownerId } = dataForQueque.data;
    return CrawlerHandler.handleRequestToAllegroFromDailyCrawling(
      crawlerArguments,
      email,
      crawlingId,
      ownerId
    );
  }
}

const resource = new DailyCrawlingQueueuHandler();
export default resource;

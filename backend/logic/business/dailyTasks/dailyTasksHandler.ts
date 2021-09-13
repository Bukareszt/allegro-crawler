import { IDailyCrawling } from "../../../Database/Models/dailyCrawling.model";
import { ICrawlerArgumentsWithCrawlerName } from "../../../types/Crawler.types";
import {
  IDailyTaskHandler,
  IDailyCrawlingDbHandler,
  IDailyCrawlingWatcher,
  ITimeDataForDailyCrawling,
} from "../../../types/DailyCrawling.types";
import { DailyCrawlingDatabaseHandler } from "./utills/dailyTaskDBHandler";
import { DailyCrawlingWatcher } from "./utills/dailyTaskWatcher";

class DailyTasksHandler implements IDailyTaskHandler {
  private dailyCrawlingDBHandler: IDailyCrawlingDbHandler;
  private dailyCrawlingWatcher: IDailyCrawlingWatcher;
  constructor() {
    this.dailyCrawlingDBHandler = new DailyCrawlingDatabaseHandler();
    this.dailyCrawlingWatcher = new DailyCrawlingWatcher();
    this.dailyCrawlingWatcher.startDailyCrawlingHandler();
  }

  public async getAllDailyTasksForGivenUser(
    userId: string
  ): Promise<Array<IDailyCrawling>> {
    try {
      return this.dailyCrawlingDBHandler.getAllDailyCrawlingsForGivenUser(
        userId
      );
    } catch (err) {
      throw err;
    }
  }

  public async createDailyTask(
    userId: string,
    crawlerArguments: ICrawlerArgumentsWithCrawlerName,
    timeData: ITimeDataForDailyCrawling
  ): Promise<void> {
    try {
      const createdDailyCrawling = await this.dailyCrawlingDBHandler.createDailyCrawling(
        userId,
        crawlerArguments,
        timeData
      );
      await this.dailyCrawlingWatcher.addDailyCrawling(createdDailyCrawling);
    } catch (err) {
      throw err;
    }
  }

  public async deleteDailyTask(
    ownerId: string,
    crawlingId: string
  ): Promise<void> {
    try {
      const crawlingToDelete = await this.dailyCrawlingDBHandler.deleteDailyCrawling(
        ownerId,
        crawlingId
      );
      this.dailyCrawlingWatcher.deleteDailyCrawling(crawlingToDelete);
    } catch (err) {
      throw err;
    }
  }

  public async deleteAllDailyTaskForGivenUser(userId: string): Promise<void> {
    try {
      const listOfCrawlingsToDelete = await this.dailyCrawlingDBHandler.deleteAllDailyCrawlingConnectedWithUser(
        userId
      );
      this.dailyCrawlingWatcher.deleteDailyAllCrawlingsForGivenUser(
        listOfCrawlingsToDelete
      );
    } catch (err) {
      throw err;
    }
  }

  public async stopDailyCrawling(
    ownerId: string,
    crawlingId: string
  ): Promise<void> {
    try {
      const dailyCrawlingToStop = await this.dailyCrawlingDBHandler.stopDailyCrawling(
        ownerId,
        crawlingId
      );
      this.dailyCrawlingWatcher.deleteDailyCrawling(dailyCrawlingToStop);
    } catch (err) {
      throw err;
    }
  }

  public async startDailyCrawling(
    ownerId: string,
    crawlingId: string
  ): Promise<void> {
    try {
      const dailyCrawling = await this.dailyCrawlingDBHandler.startDailyCrawling(
        ownerId,
        crawlingId
      );
      await this.dailyCrawlingWatcher.addDailyCrawling(dailyCrawling);
    } catch (err) {
      throw err;
    }
  }

  public async editDailyCrawlingArgumentsOrHour(
    ownerId: string,
    crawlingId: string,
    crawlerArguments: ICrawlerArgumentsWithCrawlerName,
    timeArguments: ITimeDataForDailyCrawling
  ): Promise<void> {
    try {
      const newDailyCrawling = await this.dailyCrawlingDBHandler.editDailyCrawlingArgumentsOrHour(
        ownerId,
        crawlingId,
        crawlerArguments,
        timeArguments
      );
      await this.dailyCrawlingWatcher.editDailyCrawling(newDailyCrawling);
    } catch (err) {
      throw err;
    }
  }
}

const resource = new DailyTasksHandler();
export default resource;

import DailyCrawlingModel, {
  IDailyCrawling,
} from "../../../../Database/Models/dailyCrawling.model";
import { ICrawlerArgumentsWithCrawlerName } from "../../../../types/Crawler.types";
import {
  IDailyCrawlingDbHandler,
  ITimeDataForDailyCrawling,
} from "../../../../types/DailyCrawling.types";
export class DailyCrawlingDatabaseHandler implements IDailyCrawlingDbHandler {
  public async getAllDailyCrawlingsForGivenUser(
    userId: string
  ): Promise<Array<IDailyCrawling>> {
    try {
      const dailyCrawlings = await DailyCrawlingModel.getAllDailyCrawlingForGivenUser(
        userId
      );
      return dailyCrawlings;
    } catch (err) {
      throw err;
    }
  }

  public async createDailyCrawling(
    userId: string,
    crawlerArguments: ICrawlerArgumentsWithCrawlerName,
    timeData: ITimeDataForDailyCrawling
  ): Promise<IDailyCrawling> {
    try {
      return await DailyCrawlingModel.addDailyCrawling(
        userId,
        crawlerArguments,
        timeData
      );
    } catch (err) {
      throw err;
    }
  }

  public async deleteDailyCrawling(
    ownerId: string,
    crawlingId: string
  ): Promise<IDailyCrawling> {
    try {
      return await DailyCrawlingModel.deleteDailyCrawling(ownerId, crawlingId);
    } catch (err) {
      throw err;
    }
  }

  public async deleteAllDailyCrawlingConnectedWithUser(
    userId: string
  ): Promise<Array<IDailyCrawling>> {
    try {
      return await DailyCrawlingModel.deleteAllDailyCrawlingsForGivenUser(
        userId
      );
    } catch (err) {
      throw err;
    }
  }

  public async startDailyCrawling(
    ownerId: string,
    crawlingId: string
  ): Promise<IDailyCrawling> {
    try {
      return await DailyCrawlingModel.startDailyCrawling(ownerId, crawlingId);
    } catch (err) {
      throw err;
    }
  }

  public async stopDailyCrawling(
    ownerId: string,
    crawlingId: string
  ): Promise<IDailyCrawling> {
    try {
      return await DailyCrawlingModel.stopDailyCrawling(ownerId, crawlingId);
    } catch (err) {
      throw err;
    }
  }

  public async editDailyCrawlingArgumentsOrHour(
    ownerId: string,
    crawlingId: string,
    crawlerArguments: ICrawlerArgumentsWithCrawlerName,
    timeArguments: ITimeDataForDailyCrawling
  ): Promise<IDailyCrawling> {
    try {
      return await DailyCrawlingModel.updateDailyCrawling(
        ownerId,
        crawlingId,
        crawlerArguments,
        timeArguments
      );
    } catch (err) {
      throw err;
    }
  }
}

import { IDailyCrawling } from "../Database/Models/dailyCrawling.model";
import { ICrawlerArgumentsWithCrawlerName } from "./Crawler.types";

export interface IDataForEditDailyCrawling {
  timeArguments: ITimeDataForDailyCrawling;
  crawlerArguments: ICrawlerArgumentsWithCrawlerName;
}

export interface ITimeDataForDailyCrawling {
  hourOfCrawling: number;
  minuteOfCrawling: number;
}

export interface IDailyCrawlingObject {
  crawlingConfiguration: IDailyCrawling;
  email: string;
  dateOfStart: Date;
}

export interface IDailyCrawlingDbHandler {
  getAllDailyCrawlingsForGivenUser(
    userId: string
  ): Promise<Array<IDailyCrawling>>;
  createDailyCrawling(
    userId: string,
    crawlerArguments: ICrawlerArgumentsWithCrawlerName,
    timeData: ITimeDataForDailyCrawling
  ): Promise<IDailyCrawling>;
  deleteDailyCrawling(
    ownerId: string,
    crawlingId: string
  ): Promise<IDailyCrawling>;
  deleteAllDailyCrawlingConnectedWithUser(
    userId: string
  ): Promise<Array<IDailyCrawling>>;

  startDailyCrawling(
    ownerId: string,
    crawlingId: string
  ): Promise<IDailyCrawling>;
  stopDailyCrawling(
    ownerId: string,
    crawlingId: string
  ): Promise<IDailyCrawling>;

  editDailyCrawlingArgumentsOrHour(
    ownerId: string,
    crawlerId: string,
    crawlerArguments: ICrawlerArgumentsWithCrawlerName,
    timeArguments: ITimeDataForDailyCrawling
  ): Promise<IDailyCrawling>;
}

export interface IDailyCrawlingWatcher {
  startDailyCrawlingHandler(): void;
  addDailyCrawling(dailyCrawling: IDailyCrawling): Promise<void>;
  deleteDailyCrawling(dailyCrawling: IDailyCrawling): void;
  deleteDailyAllCrawlingsForGivenUser(
    dailyCrawlings: Array<IDailyCrawling>
  ): void;
  editDailyCrawling(dailyCrawling: IDailyCrawling): Promise<void>;
}

export interface IDailyTaskHandler {
  getAllDailyTasksForGivenUser(userId: string): Promise<Array<IDailyCrawling>>;
  createDailyTask(
    userId: string,
    crawlerArguments: ICrawlerArgumentsWithCrawlerName,
    timeData: ITimeDataForDailyCrawling
  ): Promise<void>;
  deleteDailyTask(ownerId: string, crawlingId: string): Promise<void>;
  deleteAllDailyTaskForGivenUser(
    ownerId: string,
    userId: string
  ): Promise<void>;
  stopDailyCrawling(ownerId: string, crawlingId: string): Promise<void>;
  startDailyCrawling(ownerId: string, crawlingId: string): Promise<void>;

  editDailyCrawlingArgumentsOrHour(
    ownerId: string,
    crawlingId: string,
    crawlerArguments: ICrawlerArgumentsWithCrawlerName,
    timeArguments: ITimeDataForDailyCrawling
  ): Promise<void>;
}

export interface IRequestToStopDailyCrawling {
  crawlingId: string;
}

export interface IRequestToCreateDailyCrawling {
  crawlerArguments: ICrawlerArgumentsWithCrawlerName;
  timeArguments: ITimeDataForDailyCrawling;
}

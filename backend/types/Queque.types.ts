import { ICrawlerArguments } from "./Crawler.types";
import { IDailyCrawlingObject } from "./DailyCrawling.types";
import { IPayloadForAnalyzeCategory } from "./DataAnalysis.types";

export interface IObjectAddRaportQueueu {
  userId: string;
  documentId: string;
  category: string;
}
export interface IObjectForQueue {
  userId: string;
  email: string;
  crawlerArguments: ICrawlerArguments;
}

export interface IObjectForDailyQueue {
  crawlingId: string;
  email: string;
  ownerId: string;
  crawlerArguments: ICrawlerArguments;
}

export type DataAnalysisQueueNames =
  | "DataAnalysisDocumentCreate"
  | "DataAnalysisDailyRaports";

export type CrawlerQueueName =
  | "noSubscriptionNotDeepSearch"
  | "noSubscriprionWithDeepSearch"
  | "SubscriptionNotDeepSearch"
  | "SubscriprionWithDeepSearch";

export interface IDataAnalysisQueueuHandler {
  addToDailyAnalysisRaportsQueue(
    payloadForCreateAnalyze: IObjectAddRaportQueueu
  ): void;
  addToCreateAnalysisDocumentQueue(
    payloadForCreateAnalyze: IPayloadForAnalyzeCategory
  ): void;
}

export interface ICrawlerQueueuHandler {
  addToCrawlingQueue(
    userId: string,
    crawlerArguments: ICrawlerArguments
  ): Promise<void>;
}
export interface IDailyCrawlingQueueuHandler {
  addToDailyCrawlingQueueu(
    dailyCrawlingInstance: IDailyCrawlingObject
  ): Promise<void>;
}

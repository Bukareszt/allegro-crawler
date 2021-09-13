import { ICrawlerArgumentsWithCrawlerName, SortOptions } from "./Crawler.types";
import { ITimeDataForDailyCrawling } from "./DailyCrawling.types";

export interface IAmountOfCrawlingOverMonth {
  month: string;
  amount: number;
}
export interface ISubscriptionAccountData {
  haveSubscription: boolean;
  stripeCustomerId?: string;
}

export interface IDataForCrawlerLimitation {
  amountOfCrawlingOverMonth: IAmountOfCrawlingOverMonth;
  subscriptionAccountInformation: ISubscriptionAccountData;
}

export interface ISubscriptionHandler {
  validateLimitationOfCrawling(userId: string): Promise<void>;
}

export interface ISavedCrawlingConfigurationForFrontend {
  _id: string;
  nameOfCrawler: string;
  category: string;
  countOfProductsToCheck: number;
  sortBy: SortOptions;
  sellersLogins: Array<string>;
  deepSearch: boolean;
  saveFile: boolean;
}

export interface ISavedExcelFileDataForFrontend {
  title: string;
  _id: string;
}
export interface ISavedDailyCrawlingsForFrontend {
  _id: string;
  crawlerArguments: ICrawlerArgumentsWithCrawlerName;
  timeArguments: ITimeDataForDailyCrawling;
  isStopped: boolean;
}

export interface IUserDataForFrontend {
  searchedPhrases: Array<string>;
  savedDailyCrawlings: Array<ISavedDailyCrawlingsForFrontend>;
  savedConfigurationsOfCrawling: Array<ISavedCrawlingConfigurationForFrontend>;
  savedFiles: Array<ISavedExcelFileDataForFrontend>;
}

export interface IAuthorizationRequest {
  email: string;
  password: string;
}

export interface IAuthorizationRequestWithCode extends IAuthorizationRequest {
  code: string;
}

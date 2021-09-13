import { IProductData } from "./Crawler.types";

export interface IPayloadForFindRaportsToAnalyse {
  documentId: string;
  _idFrom: string;
  _idTo: string;
}

export interface ISellerDataForDataAnalysis {
  positionOnMarket: number;
  username: string;
  quantityOfAllSoldProductsInCategory: number;
  arrayOfProducts: Array<IProductDataForAnalysis>;
}
export interface IProductDataForAnalysis {
  productName: string;
  productPrice: number;
  quantityOfSoldItems: number;
  quantityLeft: number;
}

export interface IPayloadForAnalyzeCategory {
  username: string;
  category: string;
  arraysOfSellersToCheck: Array<string>;
  userId: string;
}

export interface IDataWithInformationAboutSavedRaport {
  owner: string;
  category: string;
  _id: string;
}
export interface IMarketDataPreprocesor {
  preprocessDataAboutMarket(
    dataForAnalysis: IProductData[],
    arraysOfSellersToCheck: Array<string>,
    username: string
  ): ISellerDataForDataAnalysis[];
}

export interface IUserDataPreprocessor {
  preprocessDataAboutUser(
    dataAboutMarket: Array<ISellerDataForDataAnalysis>,
    username: string
  ): ISellerDataForDataAnalysis[];
}

export interface IDataAnalyzerPreprocessor {
  preprocessDataFromAllegro(
    dataForAnalysis: IProductData[],
    arraysOfSellersToCheck: Array<string>,
    username: string
  ): ISellerDataForDataAnalysis[];
}

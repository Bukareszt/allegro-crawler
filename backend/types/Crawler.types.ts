export interface ISoldData {
  type: string;
  quantityOfSoldItems: number;
  quantityLeft: number;
}

export interface IDeliverData {
  free: boolean;
  deliveryCost: number;
}

export interface ISelerData {
  rating: string;
  deliveryCostRates: number;
  descriptionRates: number;
  serviceRates: number;
  sellerName: string;
  linkToSeller: string;
}

export interface IProductData {
  productName: string;
  productId: string;
  productPrice: number;
  category: string;
  soldData: ISoldData;
  selerData: ISelerData;
  deliverData: IDeliverData;
}

export interface INodeFetchConstant {
  method: string;
  headers: {
    Authorization: string;
    Accept: string;
  };
}

export enum SellingModeFormat {
  normal = "BUY_NOW",
  auction = "AUCTION",
  advertisement = "ADVERTISEMENT",
}

export enum SortOptions {
  priceAscending = "+price",
  priceDescending = "-price",
  priceAscendingWithDelivery = "+withDeliveryPrice",
  priceDescendingWithDelivery = "-withDeliveryPrice",
  popularityDescending = "-popularity",
}

export interface IDataAboutFile {
  idOfFile: string;
  title: string;
}

export interface ICrawlerRequest {
  crawlerArguments: ICrawlerArguments;
}

export interface ICrawlerRequestWithCrawlerName {
  crawlerArguments: ICrawlerArgumentsWithCrawlerName;
}

export interface ICrawlerArguments {
  category: string;
  countOfProductsToCheck: number;
  sortBy: SortOptions;
  sellersLogins: Array<string>;
  deepSearch: boolean;
  saveFile: boolean;
}

export interface ICrawlerArgumentsWithCrawlerName extends ICrawlerArguments {
  nameOfCrawler: string;
}

export interface ITokenDataFromAllegro {
  access_token: string;
  token_type: string;
  expires_in: number;
  expiration_date: number;
  scope: string;
  allegro_api: string;
  jti: string;
}
export interface ICrawlerHandler {
  handleRequestToAllegro(
    query: ICrawlerArguments,
    email: string,
    userId: string
  ): Promise<void>;
  handleRequestToAllegroFromDailyCrawling(
    query: ICrawlerArguments,
    email: string,
    crawlingId: string,
    ownerId: string
  );
  handleRequestToAllegroFromDataAnalysis(category: string);
}

export interface IAllegroHandler {
  handleFetchingAllegroProducts(
    query: ICrawlerArguments
  ): Promise<Array<IProductData>>;
}

export interface ITokenHadler {
  getToken(): Promise<string>;
}

export interface IUrlFactory {
  prepareUrlLinkToFirstPageOfProducts(
    queryArguments: ICrawlerArguments
  ): string;
  prepareUrlLinkToProductCategory(categoryId: string): string;
  prepareUrlLinkToUserData(userId: string): string;
  prepareUrlLinkToUserProfile(username: string): string;
}

export interface IEmailHandler {
  sendEmailWithExcelFile(
    email: string,
    phrase: string,
    idOfDocuments: string
  ): Promise<void>;
  sendEmailWithInformationAboutError(
    email: string,
    error: string
  ): Promise<void>;
  sendEmailWithInformationAboutErrorForDeveloper(error: string): Promise<void>;
}

export interface IExcelHandler {
  handleCreatingExcelFileForCrawling(
    phrase: string,
    dataToSave: Array<IProductData>
  ): Promise<IDataAboutFile>;
  handleCreatingExcelFileForDailyCrawling(
    phrase: string,
    dataToSave: Array<IProductData>,
    crawlingIdToSaveAsNameOfFile: string
  ): Promise<IDataAboutFile>;
}
export interface IRawDataFromAllegro {
  items: {
    promoted: Array<IRawProductFromAllegro>;
    regular: Array<IRawProductFromAllegro>;
  };
  categories: {
    subcategories: [
      {
        id: string;
        name: string;
      }
    ];
  };
  searchMeta: {
    availableCount: number;
    totalCount: number;
  };
}

export interface IRawProductFromAllegro {
  id: string;
  name: string;
  seller: {
    id: string;
    login: string;
  };
  delivery: {
    availableForFree: boolean;
    lowestPrice: {
      amount: string;
    };
  };

  sellingMode: {
    format: string;
    price: {
      amount: string;
    };
    popularity: number;
    bidCount: number;
  };

  stock: {
    available: number;
  };
  category: {
    id: string;
  };
}

export interface IProductDataHandler {
  fetchProductListFromAllegro(
    query: ICrawlerArguments
  ): Promise<Array<IRawProductFromAllegro>>;
}

export interface IAdditionalInfoHandler {
  loopOverArrayOfProducts(
    itemsArray: Array<IRawProductFromAllegro>,
    categoryOfProducts: string,
    deepSearching: boolean
  ): Promise<Array<IProductData>>;
}

export interface IDataForSavingFile {
  idOfFile: string;
  title: string;
  owner: string;
}

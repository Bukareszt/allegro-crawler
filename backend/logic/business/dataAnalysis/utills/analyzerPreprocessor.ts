import { IProductData } from "../../../../types/Crawler.types";
import {
  IMarketDataPreprocesor,
  IUserDataPreprocessor,
  IDataAnalyzerPreprocessor,
  ISellerDataForDataAnalysis,
} from "../../../../types/DataAnalysis.types";

class MarketDataPreprocessor implements IMarketDataPreprocesor {
  public preprocessDataAboutMarket(
    dataForAnalysis: IProductData[],
    arraysOfSellersToCheck: Array<string>,
    username: string
  ) {
    const sortedArray = this.sortArray(dataForAnalysis);
    this.handleMarketPosition(sortedArray);
    return this.removeUsersWhoAreNotNecessary(
      sortedArray,
      arraysOfSellersToCheck,
      username
    );
  }
  private removeUsersWhoAreNotNecessary(
    arrayOfProducts: ISellerDataForDataAnalysis[],
    arrayOfSellersToCheck: Array<string>,
    username: string
  ) {
    if (arrayOfSellersToCheck.length > 0) {
      arrayOfSellersToCheck.push(username);
      return arrayOfProducts.filter((productData) =>
        arrayOfSellersToCheck.includes(productData.username)
      );
    } else {
      return arrayOfProducts;
    }
  }

  private handleMarketPosition(arrayToHandle: ISellerDataForDataAnalysis[]) {
    arrayToHandle.forEach((userdata, index) => {
      userdata.positionOnMarket = index + 1;
    });
  }

  private addDataToGivenSeller(
    seller: ISellerDataForDataAnalysis,
    item: IProductData
  ) {
    seller.quantityOfAllSoldProductsInCategory +=
      item.soldData.quantityOfSoldItems;
    seller.arrayOfProducts.push({
      productName: item.productName,
      productPrice: item.productPrice,
      quantityOfSoldItems: item.soldData.quantityOfSoldItems,
      quantityLeft: item.soldData.quantityLeft,
    });
  }

  private createDataAndAddToArray(
    arrayToAdd: Array<ISellerDataForDataAnalysis>,
    item: IProductData
  ) {
    arrayToAdd.push({
      positionOnMarket: 0,
      username: item.selerData.sellerName,
      quantityOfAllSoldProductsInCategory: item.soldData.quantityOfSoldItems,
      arrayOfProducts: [
        {
          quantityOfSoldItems: item.soldData.quantityOfSoldItems,
          quantityLeft: item.soldData.quantityLeft,
          productName: item.productName,
          productPrice: item.productPrice,
        },
      ],
    });
  }

  private sortArray(dataToSort: Array<IProductData>) {
    const arrayOfAnalysedSellers: Array<ISellerDataForDataAnalysis> = [];
    dataToSort.forEach((item) => {
      const index = arrayOfAnalysedSellers.findIndex(
        (seller) => seller.username === item.selerData.sellerName
      );
      if (index != -1) {
        this.addDataToGivenSeller(arrayOfAnalysedSellers[index], item);
      } else {
        this.createDataAndAddToArray(arrayOfAnalysedSellers, item);
      }
    });

    return arrayOfAnalysedSellers.sort((a, b) => {
      return (
        b.quantityOfAllSoldProductsInCategory -
        a.quantityOfAllSoldProductsInCategory
      );
    });
  }
}

class UserDataPreporcessor implements IUserDataPreprocessor {
  public preprocessDataAboutUser(
    dataAboutMarket: Array<ISellerDataForDataAnalysis>,
    username: string
  ): ISellerDataForDataAnalysis[] {
    const userdata = this.getUserData(dataAboutMarket, username);
    const arrayToReturn = dataAboutMarket.slice(0, 10);
    this.handleAddingUserDataToArray(arrayToReturn, userdata);

    return arrayToReturn;
  }

  private getUserData(
    sortedArray: ISellerDataForDataAnalysis[],
    username: string
  ) {
    return sortedArray.find((value, index) => {
      if (value.username === username) {
        return true;
      }
      return false;
    });
  }

  private handleAddingUserDataToArray(
    arrayToAdd: ISellerDataForDataAnalysis[],
    userdata: ISellerDataForDataAnalysis
  ) {
    if (userdata) {
      if (!arrayToAdd.includes(userdata)) {
        arrayToAdd.push(userdata);
      }
    }
  }
}

export default class AnalyzerPreprocessor implements IDataAnalyzerPreprocessor {
  private marketDataPreprocessor: IMarketDataPreprocesor = new MarketDataPreprocessor();
  private userDataPreprocessor: IUserDataPreprocessor = new UserDataPreporcessor();
  public preprocessDataFromAllegro(
    dataForAnalysis: IProductData[],
    arraysOfSellersToCheck: Array<string>,
    username: string
  ): ISellerDataForDataAnalysis[] {
    const arrayWithMarketData = this.marketDataPreprocessor.preprocessDataAboutMarket(
      dataForAnalysis,
      arraysOfSellersToCheck,
      username
    );

    return this.userDataPreprocessor.preprocessDataAboutUser(
      arrayWithMarketData,
      username
    );
  }
}

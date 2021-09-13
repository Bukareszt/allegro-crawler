import AdditionalInfoHandler from "./AdditionalInfoHandler/AdditionalInfoHandler";
import {
  IAllegroHandler,
  IProductDataHandler,
  IAdditionalInfoHandler,
  ICrawlerArguments,
  IProductData,
  SortOptions,
  IRawProductFromAllegro,
} from "../../../../types/Crawler.types";
import ProductDataHandler from "./ProductDataHandler/ProductDataHandler";

export default class AllegroHandler implements IAllegroHandler {
  private productDataHandler: IProductDataHandler = new ProductDataHandler();
  private productAdditionalDataPreparer: IAdditionalInfoHandler = new AdditionalInfoHandler();

  public async handleFetchingAllegroProducts(
    crawlerArguments: ICrawlerArguments
  ): Promise<Array<IProductData>> {
    try {
      let arrayOfRawProducstData = await this.productDataHandler.fetchProductListFromAllegro(
        crawlerArguments
      );
      this.sortDataByGivenArgument(
        crawlerArguments.sortBy,
        arrayOfRawProducstData
      );

      if (
        arrayOfRawProducstData.length > crawlerArguments.countOfProductsToCheck
      ) {
        arrayOfRawProducstData = arrayOfRawProducstData.slice(
          0,
          crawlerArguments.countOfProductsToCheck
        );
      }

      const arrayOfProducts = await this.productAdditionalDataPreparer.loopOverArrayOfProducts(
        arrayOfRawProducstData,
        crawlerArguments.category,
        crawlerArguments.deepSearch
      );

      return arrayOfProducts;
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  private sortDataByGivenArgument(
    sortBy: SortOptions,
    arrayToSort: IRawProductFromAllegro[]
  ) {
    if (sortBy === "+price") {
      arrayToSort.sort(
        (productA, productB) =>
          Number(productA.sellingMode.price) -
          Number(productB.sellingMode.price)
      );
    }
    if (sortBy === "-price") {
      arrayToSort.sort(
        (productA, productB) =>
          Number(productB.sellingMode.price) -
          Number(productA.sellingMode.price)
      );
    }
    if (sortBy === "+withDeliveryPrice") {
      arrayToSort.sort(
        (productA, productB) =>
          Number(productA.delivery.lowestPrice) -
          Number(productB.delivery.lowestPrice)
      );
    }
    if (sortBy === "-withDeliveryPrice") {
      arrayToSort.sort(
        (productA, productB) =>
          Number(productB.delivery.lowestPrice) -
          Number(productA.delivery.lowestPrice)
      );
    }
    if (sortBy === "-popularity") {
      arrayToSort.sort(
        (productA, productB) =>
          productB.sellingMode.popularity - productA.sellingMode.popularity
      );
    }
  }
}

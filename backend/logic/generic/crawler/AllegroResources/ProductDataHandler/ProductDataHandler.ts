import nodeFetch from "node-fetch";
import {
  IProductDataHandler,
  IUrlFactory,
  ITokenHadler,
  IRawProductFromAllegro,
  INodeFetchConstant,
  ICrawlerArguments,
  IRawDataFromAllegro,
} from "../../../../../types/Crawler.types";

import TokenHandler from "../TokenHandler/TokenHandler";
import UrlFactory from "../UrlFactory/UrlFactory";

export default class ProductDataHandler implements IProductDataHandler {
  private urlFactory: IUrlFactory = new UrlFactory();
  private tokenHandler: ITokenHadler = new TokenHandler();

  private allegroProductsList: Array<IRawProductFromAllegro> = [];
  private productCounter!: number;
  private productsUrl!: string;
  private nodeFetchConstant!: INodeFetchConstant;
  private itemsQuantityToCheck!: number;

  public async fetchProductListFromAllegro(
    query: ICrawlerArguments
  ): Promise<Array<IRawProductFromAllegro>> {
    await this.prepareHandler(query);

    await this.fetchFirstProductsPage();
    await this.loopOverProductsPages();

    return this.allegroProductsList;
  }

  private async prepareHandler(query: ICrawlerArguments) {
    const token = await this.tokenHandler.getToken();

    this.productsUrl = this.urlFactory.prepareUrlLinkToFirstPageOfProducts(
      query
    );

    this.nodeFetchConstant = {
      method: "get",
      headers: {
        Authorization: "Bearer " + token,
        Accept: "application/vnd.allegro.public.v1+json",
      },
    };
    this.itemsQuantityToCheck = 6000;

    this.allegroProductsList = [];
    this.productCounter = 0;
  }

  private async fetchFirstProductsPage(): Promise<void> {
    try {
      const response = await nodeFetch(
        this.productsUrl,
        this.nodeFetchConstant
      );

      const dataFromAllegro: IRawDataFromAllegro = await response.json();

      if (
        dataFromAllegro.searchMeta.availableCount < this.itemsQuantityToCheck
      ) {
        this.itemsQuantityToCheck = dataFromAllegro.searchMeta.availableCount;
      }

      this.addProductsToList(dataFromAllegro.items.promoted);
      this.addProductsToList(dataFromAllegro.items.regular);
    } catch (err) {
      console.log(err);
      throw Error(
        "Problem with fetchning data from Allegro! Error data:" + err
      );
    }
  }

  private async loopOverProductsPages(): Promise<void> {
    while (this.itemsQuantityToCheck > this.productCounter) {
      try {
        const urlToPage = this.productsUrl.concat(
          `&offset=${this.productCounter}`
        );

        const response = await nodeFetch(urlToPage, this.nodeFetchConstant);

        const dataFromAllegro = await response.json();
        if (
          dataFromAllegro.items.promoted.length === 0 &&
          dataFromAllegro.items.regular.length === 0
        ) {
          break;
        }

        this.addProductsToList(dataFromAllegro.items.promoted);
        this.addProductsToList(dataFromAllegro.items.regular);
        console.log(this.productCounter);
      } catch (err) {
        console.log(err);
        this.productCounter += 60;
        continue;
      }
    }
  }

  private addProductsToList(
    arrayOfProducts: Array<IRawProductFromAllegro>
  ): void {
    if (arrayOfProducts.length > 0) {
      this.productCounter += arrayOfProducts.length;
      this.allegroProductsList.push(...arrayOfProducts);
    }
  }
}

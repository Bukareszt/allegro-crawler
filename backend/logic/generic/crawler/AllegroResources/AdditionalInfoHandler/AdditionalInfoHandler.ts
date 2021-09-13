import nodeFetch from "node-fetch";
import {
  IAdditionalInfoHandler,
  IUrlFactory,
  ITokenHadler,
  INodeFetchConstant,
  IRawProductFromAllegro,
  IProductData,
  ISoldData,
  IDeliverData,
  ISelerData,
  SellingModeFormat,
} from "../../../../../types/Crawler.types";

import TokenHandler from "../TokenHandler/TokenHandler";
import UrlFactory from "../UrlFactory/UrlFactory";

export default class AdditionalInfoHandler implements IAdditionalInfoHandler {
  private urlFactory: IUrlFactory = new UrlFactory();
  private tokenHandler: ITokenHadler = new TokenHandler();

  private nodeFetchConstant!: INodeFetchConstant;
  private categoryForQuickSearchingOrErrorsConnectedWithFetch!: string;
  private deepSearching!: boolean;

  private async prepareHandler(
    categoryForErrorsAndQuickSearching: string,
    deepSearching: boolean
  ) {
    const token = await this.tokenHandler.getToken();
    this.categoryForQuickSearchingOrErrorsConnectedWithFetch = categoryForErrorsAndQuickSearching;
    this.deepSearching = deepSearching;
    this.nodeFetchConstant = {
      method: "get",
      headers: {
        Authorization: "Bearer " + token,
        Accept: "application/vnd.allegro.public.v1+json",
      },
    };
  }

  public async loopOverArrayOfProducts(
    itemsArray: Array<IRawProductFromAllegro>,
    categoryOfProducts: string,
    deepSearching: boolean
  ): Promise<Array<IProductData>> {
    await this.prepareHandler(categoryOfProducts, deepSearching);
    const result: Array<IProductData> = [];
    for (const product of itemsArray) {
      const soldInformationData: ISoldData = this.prepareSoldInformation(
        product
      );

      const deliverData: IDeliverData = this.prepareDeliverData(product);

      try {
        const productCategoryName: string = await this.getCategory(
          product.category.id
        );

        const sellerData: ISelerData = await this.getSellerData(
          product.seller.id,
          product.seller.login
        );

        const productToAdd: IProductData = {
          productName: product.name,
          productId: product.id,
          productPrice: Number(product.sellingMode.price.amount),
          category: productCategoryName,
          selerData: sellerData,
          soldData: soldInformationData,
          deliverData: deliverData,
        };

        result.push(productToAdd);
      } catch (err) {
        const productToAddIfError: IProductData = {
          productName: product.name,
          productId: product.id,
          productPrice: Number(product.sellingMode.price.amount),
          category: this.categoryForQuickSearchingOrErrorsConnectedWithFetch,
          selerData: this.prepareSellerDataForQuickSearchingAndErrors(
            product.seller.login
          ),
          deliverData: deliverData,
          soldData: soldInformationData,
        };
        result.push(productToAddIfError);
        continue;
      }
    }
    return result;
  }

  private prepareSellerDataForQuickSearchingAndErrors(
    sellerLogin: string
  ): ISelerData {
    const urlToUser = this.urlFactory.prepareUrlLinkToUserProfile(sellerLogin);
    return {
      sellerName: sellerLogin,
      serviceRates: 0,
      deliveryCostRates: 0,
      rating: "No rating - try normal searching to get this data",
      descriptionRates: 0,
      linkToSeller: urlToUser,
    };
  }

  private getCategory(categoryId: string) {
    if (this.deepSearching) {
      return this.fetchCategoryData(categoryId);
    }
    return this.categoryForQuickSearchingOrErrorsConnectedWithFetch;
  }

  private getSellerData(sellerId: string, sellerLogin: string) {
    if (this.deepSearching) {
      return this.fetchUserData(sellerId, sellerLogin);
    }

    return this.prepareSellerDataForQuickSearchingAndErrors(sellerLogin);
  }

  private async fetchCategoryData(categoryId: string): Promise<string> {
    try {
      const urlToFetch = this.urlFactory.prepareUrlLinkToProductCategory(
        categoryId
      );
      const productData = await nodeFetch(urlToFetch, this.nodeFetchConstant);
      const { name } = await productData.json();
      return name;
    } catch (err) {
      return this.categoryForQuickSearchingOrErrorsConnectedWithFetch;
    }
  }

  private async fetchUserData(
    userId: string,
    userName: string
  ): Promise<ISelerData> {
    if (!userName || !userId) {
      return this.prepareSellerData(
        "User from Allegro Local",
        "-",
        0,
        0,
        0,
        "-"
      );
    }

    const urlToFetch = this.urlFactory.prepareUrlLinkToUserData(userId);
    const urlToUserProfile = this.urlFactory.prepareUrlLinkToUserProfile(
      userName
    );

    try {
      const rawUserData = await nodeFetch(urlToFetch, this.nodeFetchConstant);

      const userData = await rawUserData.json();

      return this.prepareSellerData(
        userName,
        userData.recommendedPercentage,
        userData.averageRates.deliveryCost,
        userData.averageRates.description,
        userData.averageRates.service,
        urlToUserProfile
      );
    } catch (err) {
      return this.prepareSellerData(
        userName,
        "No buyers ratings",
        0,
        0,
        0,
        urlToUserProfile
      );
    }
  }

  private prepareSoldInformation(product: any): ISoldData {
    const sellingMode: SellingModeFormat = product.sellingMode.format;
    switch (sellingMode) {
      case SellingModeFormat.normal:
        return {
          type: "Normal",
          quantityOfSoldItems: product.sellingMode.popularity,
          quantityLeft: product.stock.available,
        };

      case SellingModeFormat.auction:
        return {
          type: "Auction",
          quantityOfSoldItems: product.sellingMode.bidCount,
          quantityLeft: 0,
        };

      case SellingModeFormat.advertisement:
        return { type: "Advert", quantityOfSoldItems: 0, quantityLeft: 0 };
    }
  }

  private prepareDeliverData(product: any): IDeliverData {
    if (!product.delivery.lowestPrice) {
      return { free: product.delivery.availableForFree, deliveryCost: 0 };
    }
    return {
      free: product.delivery.availableForFree,
      deliveryCost: product.delivery.lowestPrice.amount,
    };
  }

  private prepareSellerData(
    name: string,
    rating: string,
    deliveryCostRates: number,
    descriptionRates: number,
    serviceRates: number,
    linkToSeller: string
  ): ISelerData {
    return {
      sellerName: name,
      rating: rating,
      deliveryCostRates: deliveryCostRates,
      descriptionRates: descriptionRates,
      serviceRates: serviceRates,
      linkToSeller: linkToSeller,
    };
  }
}

import queryString from "query-string";
import {
  IUrlFactory,
  ICrawlerArguments,
} from "../../../../../types/Crawler.types";

export default class UrlFactory implements IUrlFactory {
  private urlToAllegroProductsData = "https://api.allegro.pl/offers/listing";

  private urlToAllegroCategoryData = "https://api.allegro.pl/sale/categories";
  private urlToAllegroUserData = "https://api.allegro.pl/users";

  private urlToAllegroProfile = "https://allegro.pl/uzytkownik/";

  private includeQueryForAllegroAPI =
    "-all&include=items&include=categories&include=searchMeta";

  public prepareUrlLinkToFirstPageOfProducts(
    queryArguments: ICrawlerArguments
  ): string {
    if (queryArguments.sellersLogins.length === 0) {
      return queryString.stringifyUrl({
        url: this.urlToAllegroProductsData,
        query: {
          phrase: queryArguments.category,
          sort: queryArguments.sortBy,
          include: this.includeQueryForAllegroAPI,
        },
      });
    }
    const queryStringWithSellersLogins = this.prepareQueryStringWithSellersLogins(
      queryArguments.sellersLogins
    );
    return queryString
      .stringifyUrl({
        url: this.urlToAllegroProductsData,
        query: {
          phrase: queryArguments.category,
          sort: queryArguments.sortBy,
          include: this.includeQueryForAllegroAPI,
        },
      })
      .concat(queryStringWithSellersLogins);
  }

  public prepareUrlLinkToProductCategory(categoryId: string): string {
    return `${this.urlToAllegroCategoryData}/${categoryId}`;
  }

  public prepareUrlLinkToUserData(userId: string): string {
    return `${this.urlToAllegroUserData}/${userId}/ratings-summary`;
  }

  public prepareUrlLinkToUserProfile(username: string): string {
    return this.urlToAllegroProfile.concat(username);
  }

  private prepareQueryStringWithSellersLogins(
    arrayOfSellers: Array<string>
  ): string {
    let queryStringWithSellersLogins = "";
    arrayOfSellers.forEach((login: string) => {
      const queryToAdd = "&seller.login=" + login;
      queryStringWithSellersLogins += queryToAdd;
    });

    return queryStringWithSellersLogins;
  }
}

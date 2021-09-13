import AllegroHandler from "./AllegroResources/AllegroHandler";
import EmailHandler from "./EmailHandler/EmailHandler";
import { ExcelHandler } from "./ExcelResource/ExcelHandler";
import FileSaveHandler from "../fileSave/fileSaveHandler";
import UserModel from "../../../Database/Models/user.model";
import {
  ICrawlerHandler,
  IAllegroHandler,
  IEmailHandler,
  IExcelHandler,
  ICrawlerArguments,
  IDataAboutFile,
  SortOptions,
} from "../../../types/Crawler.types";

class CrawlerHandler implements ICrawlerHandler {
  private allegroHandler: IAllegroHandler = new AllegroHandler();
  private emailHandler: IEmailHandler = new EmailHandler();
  private excelHandler: IExcelHandler = new ExcelHandler();

  public async handleRequestToAllegro(
    query: ICrawlerArguments,
    email: string,
    userId: string
  ): Promise<void> {
    try {
      const fileData = await this.handleDataCollectionAndSendingThemToClient(
        query,
        email
      );

      await this.handleSavingDataAboutUserAndFiles(query, userId, fileData);
    } catch (err) {
      console.log(err);
    }
  }

  public async handleRequestToAllegroFromDailyCrawling(
    query: ICrawlerArguments,
    email: string,
    crawlingId: string,
    userId: string
  ) {
    try {
      const fileData = await this.handleDataCollectionAndSendingThemToClientForDailyCrawling(
        query,
        email,
        crawlingId
      );

      await this.handleSavingDataAboutUserAndFiles(query, userId, fileData);
    } catch (err) {
      console.log(err);
    }
  }

  public async handleRequestToAllegroFromDataAnalysis(category: string) {
    try {
      const crawlerArguments = this.prepareCrawlerArgumentsForDataAnalysis(
        category
      );

      return await this.allegroHandler.handleFetchingAllegroProducts(
        crawlerArguments
      );
    } catch (err) {
      throw err;
    }
  }

  private async handleSavingDataAboutUserAndFiles(
    query: ICrawlerArguments,
    userId: string,
    dataAboutFile: IDataAboutFile
  ) {
    const { title, idOfFile } = dataAboutFile;
    try {
      await UserModel.saveSearchedPhraseAndIncrementAmountOfCrawling(
        userId,
        query.category
      );

      await FileSaveHandler.handleSavingFile(query.saveFile, {
        title,
        idOfFile,
        owner: userId,
      });
    } catch (err) {
      await this.emailHandler.sendEmailWithInformationAboutErrorForDeveloper(
        err.message
      );
    }
  }

  private async handleDataCollectionAndSendingThemToClient(
    query: ICrawlerArguments,
    email: string
  ): Promise<IDataAboutFile> {
    try {
      const arrayOfProducts = await this.allegroHandler.handleFetchingAllegroProducts(
        query
      );

      const {
        title,
        idOfFile,
      } = await this.excelHandler.handleCreatingExcelFileForCrawling(
        query.category,
        arrayOfProducts
      );

      await this.emailHandler.sendEmailWithExcelFile(
        email,
        query.category,
        idOfFile
      );

      return { title, idOfFile };
    } catch (err) {
      try {
        await this.emailHandler.sendEmailWithInformationAboutError(email, err);
      } catch (err) {
        console.log(err);
      }
    }
  }

  private async handleDataCollectionAndSendingThemToClientForDailyCrawling(
    query: ICrawlerArguments,
    email: string,
    crawlingId: string
  ): Promise<IDataAboutFile> {
    try {
      const arrayOfProducts = await this.allegroHandler.handleFetchingAllegroProducts(
        query
      );

      const {
        title,
        idOfFile,
      } = await this.excelHandler.handleCreatingExcelFileForDailyCrawling(
        query.category,
        arrayOfProducts,
        crawlingId
      );

      await this.emailHandler.sendEmailWithExcelFile(
        email,
        query.category,
        idOfFile
      );

      return { title, idOfFile };
    } catch (err) {
      try {
        console.log(err);
        await this.emailHandler.sendEmailWithInformationAboutError(email, err);
      } catch (nextErr) {
        console.log(nextErr);
      }
    }
  }

  private prepareCrawlerArgumentsForDataAnalysis(
    category: string
  ): ICrawlerArguments {
    return {
      category,
      countOfProductsToCheck: 300,
      sortBy: SortOptions.popularityDescending,
      sellersLogins: [],
      saveFile: false,
      deepSearch: false,
    };
  }
}

const resource = new CrawlerHandler();
export default resource;

import Queue from "bull";
import dotenv from "dotenv";
import CrawlerHandler from "../crawler/CrawlerHandler";
import {
  IDataAnalysisQueueuHandler,
  DataAnalysisQueueNames,
  IObjectAddRaportQueueu,
} from "../../../types/Queque.types";
import dataAnalysisHandler from "../../business/dataAnalysis/dataAnalysisHandler";
import { IPayloadForAnalyzeCategory } from "../../../types/DataAnalysis.types";

dotenv.config();

class DataAnalysisQueueuHandler implements IDataAnalysisQueueuHandler {
  private quequeNames: Array<DataAnalysisQueueNames> = [
    "DataAnalysisDocumentCreate",
    "DataAnalysisDailyRaports",
  ];
  private queues = {};

  constructor() {
    this.quequeNames.forEach((name) => {
      this.addFunctionalityToQueueu(name);
    });
  }

  public addToDailyAnalysisRaportsQueue(
    payloadForCreateAnalyze: IObjectAddRaportQueueu
  ): void {
    const queueForDailyCrawling = this.getByName("DataAnalysisDailyRaports");

    queueForDailyCrawling.add(payloadForCreateAnalyze);
  }

  public addToCreateAnalysisDocumentQueue(
    payloadForCreateAnalyze: IPayloadForAnalyzeCategory
  ): void {
    const queueForDailyCrawling = this.getByName("DataAnalysisDocumentCreate");

    queueForDailyCrawling.add(payloadForCreateAnalyze);
  }

  private getByName(name: DataAnalysisQueueNames) {
    return this.queues[name];
  }
  private addFunctionalityToQueueu(name: DataAnalysisQueueNames) {
    let queue;
    if (process.env.DB_TYPE_ENV === "test") {
      queue = new Queue(name);
    } else {
      queue = new Queue(name, "redis://redisdb:6379");
    }
    if (name === "DataAnalysisDailyRaports") {
      queue.process(this.dataAnalysisForExistingDocument);
    } else {
      queue.process(this.dataAnalysisDocumentCreationQueue);
    }
    this.queues[name] = queue;
  }

  private async dataAnalysisDocumentCreationQueue(dataForQueque) {
    const payloadForCreateAnalyze: IPayloadForAnalyzeCategory =
      dataForQueque.data;
    const dataToAnalyze = await CrawlerHandler.handleRequestToAllegroFromDataAnalysis(
      payloadForCreateAnalyze.category
    );

    return await dataAnalysisHandler.handleCreatingNewReport(
      dataToAnalyze,
      payloadForCreateAnalyze
    );
  }

  private async dataAnalysisForExistingDocument(dataForQueque) {
    const dataAboutDailyRaport: IObjectAddRaportQueueu = dataForQueque.data;

    const dataToAnalyze = await CrawlerHandler.handleRequestToAllegroFromDataAnalysis(
      dataAboutDailyRaport.category
    );
    return await dataAnalysisHandler.addNewRaportToDocument(
      dataAboutDailyRaport.userId,
      dataAboutDailyRaport.documentId,
      dataToAnalyze
    );
  }
}

const resource = new DataAnalysisQueueuHandler();
export default resource;

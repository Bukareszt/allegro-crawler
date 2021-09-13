import DataAnalyzerPreprocessor from "./utills/analyzerPreprocessor";
import { IProductData } from "../../../types/Crawler.types";
import {
  IDataAnalyzerPreprocessor,
  IPayloadForAnalyzeCategory,
} from "../../../types/DataAnalysis.types";
import { AnalysisWatcher } from "./utills/analysisWatcher";
import DataAnalysisDocumentModel from "../../../Database/Models/dataAnalysisDocumet.model";

class DataAnylysisHandler {
  private dataAnalyzerPreprocessor: IDataAnalyzerPreprocessor = new DataAnalyzerPreprocessor();
  private dataAnalysisWatcher = new AnalysisWatcher();
  public async handleCreatingNewReport(
    dataToAnalyse: Array<IProductData>,
    dataForCreateAnalysys: IPayloadForAnalyzeCategory
  ) {
    const {
      category,
      arraysOfSellersToCheck,
      username,
      userId,
    } = dataForCreateAnalysys;
    try {
      const firstReport = this.dataAnalyzerPreprocessor.preprocessDataFromAllegro(
        dataToAnalyse,
        arraysOfSellersToCheck,
        username
      );
      await DataAnalysisDocumentModel.createDataAnalysisDocument(
        { category, arraysOfSellersToCheck, username, userId },
        firstReport
      );
    } catch (err) {
      throw err;
    }
  }

  public async addNewRaportToDocument(
    userId: string,
    documentId: string,
    dataToAnalyse: Array<IProductData>
  ) {
    try {
      const document = await DataAnalysisDocumentModel.getDocument(
        userId,
        documentId
      );
      const preprocessedData = this.dataAnalyzerPreprocessor.preprocessDataFromAllegro(
        dataToAnalyse,
        document.arraysOfSellersToCheck,
        document.usernameToUseAsReference
      );
      await DataAnalysisDocumentModel.addRaportToDocument(
        userId,
        documentId,
        preprocessedData
      );
    } catch (err) {
      console.log(err);
    }
  }

  public async deleteDocument(userId: string, documentId: string) {
    try {
      await DataAnalysisDocumentModel.deleteDocument(userId, documentId);
    } catch (err) {
      throw err;
    }
  }
}

const resource = new DataAnylysisHandler();

export default resource;

import cron from "node-cron";
import DataAnalysisReportModel from "../../../../Database/Models/dataAnalysisDocumet.model";
import DataAnalysisQueueuHandler from "../../../generic/Queue/AnalysisQueueHandler";

export class AnalysisWatcher {
  constructor() {
    this.startDataAnalysisWatcher();
  }

  private dataAnalysisWatcher: cron.ScheduledTask;

  private startDataAnalysisWatcher() {
    this.dataAnalysisWatcher = cron.schedule(`0 0 * * *`, async () => {
      try {
        const listOfRaportsToExecute = await this.getAllSavedDocumentsFromServer();
        for (const raport of listOfRaportsToExecute) {
          DataAnalysisQueueuHandler.addToDailyAnalysisRaportsQueue({
            category: raport.category,
            userId: raport.owner.toString(),
            documentId: raport._id.toString(),
          });
        }
      } catch (err) {
        throw err;
      }
    });
  }

  private getAllSavedDocumentsFromServer() {
    return DataAnalysisReportModel.getAllDocumentsForWatcher();
  }
}

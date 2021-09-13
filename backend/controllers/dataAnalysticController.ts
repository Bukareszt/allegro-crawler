import { Request, Response } from "express";

import DataAnalysisQueueuHandler from "../logic/generic/Queue/AnalysisQueueHandler";
import handleError from "./utills/errorHandler";
import dataAnalysisHandler from "../logic/business/dataAnalysis/dataAnalysisHandler";
import { IResponseMsg } from "../types/Controllers.types";
import prepareResponse from "../utills/Response/prepareResponse";

export interface IRequestToCreateNewAnalysDocument {
  category: string;
  username: string;
  arraysOfSellersToCheck: Array<string>;
}

export default class DataAnalysticController {
  public async createNewAnalysDocument(
    req: Request<{}, {}, IRequestToCreateNewAnalysDocument>,
    res: Response
  ) {
    const { category, username, arraysOfSellersToCheck } = req.body;
    const userId: string = req["userId"];
    return handleError(req, res, async () => {
      DataAnalysisQueueuHandler.addToCreateAnalysisDocumentQueue({
        category,
        username,
        arraysOfSellersToCheck,
        userId,
      });
      const responseObject: IResponseMsg = prepareResponse(
        "The document is being prepared, and soon you will can check it."
      );
      res.status(202).json(responseObject);
    });
  }

  public async deleteDocument(
    req: Request<{ id: string }, {}, {}>,
    res: Response
  ) {
    const userId: string = req["userId"];
    const documentId: string = req.params.id;
    return handleError(req, res, async () => {
      await dataAnalysisHandler.deleteDocument(userId, documentId);
      const responseObject: IResponseMsg = prepareResponse(
        "The document was deleted"
      );
      res.status(200).json(responseObject);
    });
  }
}

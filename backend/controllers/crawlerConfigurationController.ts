import { Request, Response } from "express";
import { IResponseMsg } from "../types/Controllers.types";

import prepareResponse, {
  prepareResponseWithData,
} from "../utills/Response/prepareResponse";
import CrawlingConfigurationModel from "../Database/Models/crawlingConfiguration.model";
import CrawlerQueueuHandler from "../logic/generic/Queue/CrawlingQueueuHandler";
import {
  ICrawlerArgumentsWithCrawlerName,
  ICrawlerRequestWithCrawlerName,
} from "../types/Crawler.types";
import handleError from "./utills/errorHandler";

export default class CrawlerConfigurationController {
  public async saveCrawlerConfiguration(
    req: Request<{}, {}, ICrawlerRequestWithCrawlerName>,
    res: Response
  ) {
    const { crawlerArguments } = req.body;
    const userId: string = req["userId"];

    return handleError(req, res, async () => {
      const resourceId: string = await CrawlingConfigurationModel.createConfiguration(
        userId,
        crawlerArguments
      );

      const responseObject = prepareResponseWithData(
        "Crawler configuration was saved!",
        { _id: resourceId }
      );
      return res.status(200).json(responseObject);
    });
  }

  public async editCrawlerConfiguration(
    req: Request<{ id: string }, {}, ICrawlerRequestWithCrawlerName>,
    res: Response
  ) {
    const userId: string = req["userId"];

    const crawlingId: string = req.params.id;
    const { crawlerArguments } = req.body;

    return handleError(req, res, async () => {
      await CrawlingConfigurationModel.editConfiguration(
        userId,
        crawlingId,
        crawlerArguments
      );

      const responseObject: IResponseMsg = prepareResponse(
        "New crawler configuration was saved!"
      );
      return res.status(200).json(responseObject);
    });
  }

  public async deleteCrawlerConfiguration(
    req: Request<{ id: string }, {}, {}>,
    res: Response
  ) {
    const userId: string = req["userId"];
    const crawlingId: string = req.params.id;

    return handleError(req, res, async () => {
      await CrawlingConfigurationModel.deleteConfiguration(userId, crawlingId);
      const responseObject: IResponseMsg = prepareResponse(
        "Crawler configuration was deleted!"
      );
      return res.status(200).json(responseObject);
    });
  }

  public async deleteAllCrawlerConfigurationForGivenUser(
    req: Request<{}, {}, {}>,
    res: Response
  ) {
    return handleError(req, res, async () => {
      const userId: string = req["userId"];
      await CrawlingConfigurationModel.deleteAllConfigurationsForGivenUser(
        userId
      );
      const responseObject: IResponseMsg = prepareResponse(
        "All crawler configuration for given user was deleted!"
      );
      return res.status(200).json(responseObject);
    });
  }

  public async useSavedCrawlerConfiguration(
    req: Request<{ id: string }, {}, {}>,
    res: Response
  ) {
    return handleError(req, res, async () => {
      const userId: string = req["userId"];
      const crawlingId: string = req.params.id;

      const configurationToUse: ICrawlerArgumentsWithCrawlerName = await CrawlingConfigurationModel.getConfiguration(
        userId,
        crawlingId
      );
      CrawlerQueueuHandler.addToCrawlingQueue(userId, configurationToUse);
      const responseObject: IResponseMsg = prepareResponse(
        "Crawling has started! When everything will be ready, we will send you an email with data."
      );
      return res.status(202).json(responseObject);
    });
  }
}

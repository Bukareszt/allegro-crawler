import { Request, Response } from "express";
import PaymentsHandler from "../logic/business/subscription/SubscriptionHandler";
import { IResponseMsg } from "../types/Controllers.types";
import prepareResponse from "../utills/Response/prepareResponse";

import CrawlerQueueuHandler from "../logic/generic/Queue/CrawlingQueueuHandler";
import handleError from "./utills/errorHandler";
import { ICrawlerRequest } from "../types/Crawler.types";

export interface IRequestToStopDailyCrawling {
  crawlingId: string;
}

export default class CrawlerController {
  public async crawlAllegro(
    req: Request<{}, {}, ICrawlerRequest>,
    res: Response
  ) {
    const userId: string = req["userId"];
    const { crawlerArguments } = req.body;

    return handleError(req, res, async () => {
      await PaymentsHandler.validateLimitationOfCrawling(userId);
      CrawlerQueueuHandler.addToCrawlingQueue(userId, crawlerArguments);
      const responseObject: IResponseMsg = prepareResponse(
        "Crawling has started! When everything will be ready, we will send you an email with data."
      );
      return res.status(202).json(responseObject);
    });
  }
}

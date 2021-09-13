import { Request, Response } from "express";
import { IResponseMsg } from "../types/Controllers.types";
import prepareResponse from "../utills/Response/prepareResponse";

import { IRequestToCreateDailyCrawling } from "../types/DailyCrawling.types";
import DailyTasksHandler from "../logic//business/dailyTasks/dailyTasksHandler";
import handleError from "./utills/errorHandler";

export default class DailyCrawlerController {
  public async createAndStartDailyCrawling(
    req: Request<{}, {}, IRequestToCreateDailyCrawling>,
    res: Response
  ) {
    const { crawlerArguments, timeArguments } = req.body;
    const userId: string = req["userId"];

    return handleError(req, res, async () => {
      await DailyTasksHandler.createDailyTask(
        userId,
        crawlerArguments,
        timeArguments
      );
      const responseObject: IResponseMsg = prepareResponse(
        "Daily Crawling was saved in database, and will start on time."
      );

      return res.status(201).json(responseObject);
    });
  }

  public async editDailyCrawling(
    req: Request<{ id: string }, {}, IRequestToCreateDailyCrawling>,
    res: Response
  ) {
    const userId: string = req["userId"];
    const crawlingId = req.params.id;

    const { crawlerArguments, timeArguments } = req.body;

    return handleError(req, res, async () => {
      await DailyTasksHandler.editDailyCrawlingArgumentsOrHour(
        userId,
        crawlingId,
        crawlerArguments,
        timeArguments
      );

      const responseObject: IResponseMsg = prepareResponse(
        "Daily Crawling was updated ."
      );

      return res.status(200).json(responseObject);
    });
  }

  public async deleteDailyCrawling(
    req: Request<{ id: string }, {}, {}>,
    res: Response
  ) {
    const userId: string = req["userId"];
    const crawlingId: string = req.params.id;
    return handleError(req, res, async () => {
      await DailyTasksHandler.deleteDailyTask(userId, crawlingId);

      const responseObject: IResponseMsg = prepareResponse(
        "Daily Crawling with givenId was deleted!"
      );

      return res.status(200).json(responseObject);
    });
  }

  public async deleteAllUserDailyCrawlings(
    req: Request<{}, {}, {}>,
    res: Response
  ) {
    const userId: string = req["userId"];

    return handleError(req, res, async () => {
      await DailyTasksHandler.deleteAllDailyTaskForGivenUser(userId);
      return res.status(204).send();
    });
  }

  public async startDailyCrawling(
    req: Request<{ id: string }, {}, {}>,
    res: Response
  ) {
    const crawlingId = req.params.id;
    const userId: string = req["userId"];

    return handleError(req, res, async () => {
      await DailyTasksHandler.startDailyCrawling(userId, crawlingId);

      const responseObject: IResponseMsg = prepareResponse(
        "Daily crawling with given id was started!."
      );
      return res.status(200).json(responseObject);
    });
  }

  public async stopDailyCrawling(
    req: Request<{ id: string }, {}, {}>,
    res: Response
  ) {
    const crawlingId = req.params.id;
    const userId: string = req["userId"];

    return handleError(req, res, async () => {
      await DailyTasksHandler.stopDailyCrawling(userId, crawlingId);
      const responseObject: IResponseMsg = prepareResponse(
        "Daily crawling with given id was stopped!."
      );
      return res.status(200).send(responseObject);
    });
  }
}

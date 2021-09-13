import { Request, Response } from "express";
import handleError from "./utills/errorHandler";
import SavedExcelFileHandler from "../logic/generic/fileSave/fileSaveHandler";
import { IResponseMsg } from "../types/Controllers.types";
import prepareResponse from "../utills/Response/prepareResponse";

export default class SavedFilesController {
  public downloadFile(req: Request<{ id: string }, {}, {}>, res: Response) {
    const userId: string = req["userId"];
    const { id } = req.params;

    return handleError(req, res, async () => {
      const pathToFile = await SavedExcelFileHandler.preparePathToDownloadFile(
        userId,
        id
      );
      return res.status(200).download(pathToFile, "ALLEGROCRAWLER.xlsx");
    });
  }

  public deleteAllFilesForGivenUser(req: Request, res: Response) {
    const userId: string = req["userId"];

    return handleError(req, res, async () => {
      await SavedExcelFileHandler.deleteAllSavedFilesForGivenUser(userId);
      const responseObject: IResponseMsg = prepareResponse(
        "All files was deleted!"
      );

      return res.status(200).json(responseObject);
    });
  }

  public deleteFileForGivenUser(
    req: Request<{ id: string }, {}, {}>,
    res: Response
  ) {
    const userId: string = req["userId"];
    const { id } = req.params;

    return handleError(req, res, async () => {
      const result = await SavedExcelFileHandler.deleteFile(userId, id);
      const responseObject: IResponseMsg = prepareResponse(
        "File with given ID was deleted!"
      );

      return res.status(200).json(responseObject);
    });
  }
}

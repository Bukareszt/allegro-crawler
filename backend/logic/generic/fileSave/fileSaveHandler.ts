import path from "path";
import fs from "fs";
import SavedExcelFileModel from "../../../Database/Models/savedExcelFile.model";
import { IDataForSavingFile } from "../../../types/Crawler.types";

class FileSaveHandler {
  private pathToExcelFile = path.join(__dirname, "../WorkFiles/");
  private excelFileEnd = ".xlsx";

  public async handleSavingFile(
    saveFile: boolean,
    argumentsForSavingFile: IDataForSavingFile
  ): Promise<void> {
    const { idOfFile, title, owner } = argumentsForSavingFile;
    try {
      if (!saveFile) {
        this.deleteExcelFile(idOfFile);
      } else {
        await this.saveFileDataInDatabase(idOfFile, title, owner);
      }
    } catch (err) {
      throw err;
    }
  }

  public async preparePathToDownloadFile(
    userId: string,
    id: string
  ): Promise<string> {
    try {
      const { idOfFile } = await SavedExcelFileModel.getFileInfo(userId, id);
      return this.pathToExcelFile + idOfFile + this.excelFileEnd;
    } catch (err) {
      throw err;
    }
  }

  public async deleteAllSavedFilesForGivenUser(userId: string) {
    try {
      const result = await SavedExcelFileModel.deleteAllExcelFilesForGivenUser(
        userId
      );

      result.forEach((fileToDelete) => {
        this.deleteExcelFile(fileToDelete.idOfFile);
      });
    } catch (err) {
      throw err;
    }
  }

  public async deleteFile(userId: string, fileId: string) {
    try {
      const { idOfFile } = await SavedExcelFileModel.deleteExcelFile(
        userId,
        fileId
      );

      this.deleteExcelFile(idOfFile);
    } catch (err) {
      throw err;
    }
  }

  private deleteExcelFile(id: string): void {
    fs.unlinkSync(this.pathToExcelFile + id + this.excelFileEnd);
  }

  private async saveFileDataInDatabase(
    idOfSavedFile: string,
    title: string,
    owner: string
  ) {
    try {
      await SavedExcelFileModel.createExcelFileInfo(
        owner,
        idOfSavedFile,
        title
      );
    } catch (err) {
      throw err;
    }
  }
}

const resource = new FileSaveHandler();

export default resource;

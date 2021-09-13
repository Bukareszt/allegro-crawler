import Excel from "exceljs";
import moment from "moment";
import path from "path";
import headerKeyConstants from "./Constants/headerKeyConstantsForExcel";

import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import {
  IExcelHandler,
  IProductData,
  IDataAboutFile,
} from "../../../../types/Crawler.types";

export class ExcelHandler implements IExcelHandler {
  private pathToExcelFile = path.join(__dirname, "../../WorkFiles/");
  private excelFileEnd = ".xlsx";

  public async handleCreatingExcelFileForCrawling(
    phrase: string,
    dataToSave: Array<IProductData>
  ): Promise<IDataAboutFile> {
    try {
      const id = uuidv4();

      const filePath = this.pathToExcelFile + id + this.excelFileEnd;

      const title = await this.createExcelFileAndReturnTitle(
        phrase,
        filePath,
        dataToSave
      );
      return { idOfFile: id, title: title };
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  public async handleCreatingExcelFileForDailyCrawling(
    phrase: string,
    dataToSave: Array<IProductData>,
    crawlingIdToSaveAsNameOfFile: string
  ): Promise<IDataAboutFile> {
    try {
      const filePath =
        this.pathToExcelFile + crawlingIdToSaveAsNameOfFile + this.excelFileEnd;
      let title: string;
      if (!fs.existsSync(filePath)) {
        title = await this.createExcelFileAndReturnTitle(
          phrase,
          filePath,
          dataToSave
        );
      } else {
        title = await this.saveToExcelFile(phrase, filePath, dataToSave);
      }

      return { idOfFile: crawlingIdToSaveAsNameOfFile, title: title };
    } catch (err) {
      throw err;
    }
  }

  private async createExcelFileAndReturnTitle(
    phrase: string,
    filePath: string,
    dataToSave: Array<IProductData>
  ) {
    try {
      if (!fs.existsSync(this.pathToExcelFile)) {
        fs.mkdirSync(this.pathToExcelFile);
      }
      const workbook = new Excel.Workbook();
      const title = this.handleCreatingWorksheet(phrase, workbook, dataToSave);
      await workbook.xlsx.writeFile(filePath);

      return title;
    } catch (err) {
      throw err;
    }
  }
  private async saveToExcelFile(
    phrase: string,
    filePath: string,
    dataToSave: Array<IProductData>
  ) {
    const workbook = new Excel.Workbook();
    const excelFile = await workbook.xlsx.readFile(filePath);
    const title = this.handleCreatingWorksheet(phrase, excelFile, dataToSave);

    await excelFile.xlsx.writeFile(filePath);
    return title;
  }

  private handleCreatingWorksheet(
    phrase: string,
    workbook: Excel.Workbook,
    dataToSave: Array<IProductData>
  ): string {
    const title = this.createTitleOfDocument(phrase);
    this.setExcelProporites(workbook);
    const worksheet = this.createWorksheet(workbook, title);
    this.addHeadersToColumsAndFormat(worksheet);
    this.insertDataToWorksheet(worksheet, dataToSave);
    return title;
  }

  private setExcelProporites(workbook: Excel.Workbook): void {
    workbook.creator = "Bukareszt";
    workbook.created = new Date();
  }

  private createWorksheet(
    workbook: Excel.Workbook,
    title: string
  ): Excel.Worksheet {
    return workbook.addWorksheet(title);
  }

  private addHeadersToColumsAndFormat(worksheet: any): void {
    const objects = [];
    for (const [header, key] of Object.entries(headerKeyConstants)) {
      objects.push(key);
    }

    worksheet.columns = objects;

    worksheet.columns.forEach((column: any) => {
      column.width = column.header.length < 20 ? 20 : column.header.length;
    });
    worksheet.getRow(1).font = { bold: true };
  }

  private insertDataToWorksheet(
    worksheet: Excel.Worksheet,
    data: Array<IProductData>
  ): void {
    data.forEach((product) => {
      worksheet.addRow({
        productName: product.productName,
        productId: product.productId,
        productPrice: product.productPrice,
        category: product.category,
        type: product.soldData.type,
        quantityOfSoldItems: product.soldData.quantityOfSoldItems,
        quantityLeft: product.soldData.quantityLeft,
        freeDeliver: product.deliverData.free,
        deliveryCost: product.deliverData.deliveryCost,
        sellerName: product.selerData.sellerName,
        rating: product.selerData.rating,
        deliveryCostRates: product.selerData.deliveryCostRates,
        descriptionRates: product.selerData.descriptionRates,
        serviceRates: product.selerData.serviceRates,
        linkToSeller: product.selerData.linkToSeller,
      });
    });
  }

  private createTitleOfDocument(phrase: string): string {
    const dateOfSaving: string = moment().format("MMMM-DD-YYYY");
    const phraseString = "$ - ".concat(phrase.replace(/\s/g, ""));
    const title = dateOfSaving.concat(phraseString);
    return title;
  }
}

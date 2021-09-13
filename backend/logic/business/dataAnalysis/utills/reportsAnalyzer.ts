import { report } from "process";
import DataAnalysisDocumentModel from "../../../../Database/Models/dataAnalysisDocumet.model";
import { IReportForAnalysis } from "../../../../Database/Models/raportForAnalysis.model";
import {
  IPayloadForFindRaportsToAnalyse,
  IProductDataForAnalysis,
  ISellerDataForDataAnalysis,
} from "../../../../types/DataAnalysis.types";




class RaportAnalyzer {}

/*/
//export interface IReportPattern {
//  documentId: string;
//  dateOfCreation: string;
//  raportData: Array<ISellerDataForDataAnalysis>;
// }
export interface ISellerDataForDataAnalysis {
  positionOnMarket: number;
  username: string;
  quantityOfAllSoldProductsInCategory: number;
  arrayOfProducts: Array<IProductDataForAnalysis>;
}
*/

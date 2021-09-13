import { model, Schema, Document, Model } from "mongoose";
import moment from "moment";
import {
  IPayloadForFindRaportsToAnalyse,
  ISellerDataForDataAnalysis,
} from "../../types/DataAnalysis.types";
import DataAnalysisDocumentModel from "./dataAnalysisDocumet.model";

export interface IReportPattern {
  documentId: string;
  dateOfCreation: string;
  raportData: Array<ISellerDataForDataAnalysis>;
}
export interface IReportForAnalysis extends Document, IReportPattern {}

export interface IReportForAnalysisModel extends Model<IReportForAnalysis> {
  createRaport(
    documentId: string,
    raportData: Array<ISellerDataForDataAnalysis>
  ): Promise<string>;
  getRaports(
    payloadForFindRaports: IPayloadForFindRaportsToAnalyse
  ): Promise<Array<IReportForAnalysis>>;
  deleteRaportsForGivenDocument(documentId: string): Promise<void>;
}
const ReportForAnalysisSchema: Schema = new Schema({
  documentId: { type: Schema.Types.ObjectId, ref: "DataAnalysisDocument" },
  dateOfCreation: { type: String },
  raportData: [
    {
      positionOnMarket: { type: Number },
      username: { type: String },
      quantityOfAllSoldProductsInCategory: { type: Number },
      arrayOfProducts: {
        type: [
          {
            productName: { type: String },
            productPrice: { type: Number },
            quantityOfSoldItems: { type: Number },
            quantityLeft: { type: Number },
          },
        ],
      },
    },
  ],
});

ReportForAnalysisSchema.statics.createRaport = async function (
  documentId: string,
  raportData: Array<ISellerDataForDataAnalysis>
) {
  const document = await DataAnalysisDocumentModel.findById(
    documentId.toString()
  );

  const objectToCreate: IReportPattern = {
    documentId,
    dateOfCreation: moment().format("MM-DD-YYYY"),
    raportData,
  };
  const entry = await this.create(objectToCreate);
  const { _id } = await entry.save();
  return _id;
};

ReportForAnalysisSchema.statics.getRaports = async function (
  dataForGetRaports: IPayloadForFindRaportsToAnalyse
) {
  const { documentId, _idFrom, _idTo } = dataForGetRaports;
  const raports: Array<IReportForAnalysis> = await this.find({
    documentId: documentId,
  });
  const indexFrom = findIndex(raports, _idFrom);
  const indexTo = findIndex(raports, _idTo);
  if (indexFrom > indexTo) {
    return raports.slice(indexTo, indexFrom + 1);
  }
  return raports.slice(indexFrom, indexTo + 1);
};

ReportForAnalysisSchema.statics.deleteRaportsForGivenDocument = async function (
  documentId: string
) {
  return await this.deleteMany({ documentId: documentId });
};

const findIndex = (raports: Array<IReportForAnalysis>, _id: string) =>
  raports.findIndex((raport) => raport._id.toString() == _id.toString());

const ReportForAnalysisModel = model<
  IReportForAnalysis,
  IReportForAnalysisModel
>("ReportForAnalysis", ReportForAnalysisSchema);

export default ReportForAnalysisModel;

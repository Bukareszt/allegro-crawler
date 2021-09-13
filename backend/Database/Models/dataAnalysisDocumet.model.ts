import { model, Schema, Document, Model } from "mongoose";
import {
  IDataWithInformationAboutSavedRaport,
  IPayloadForAnalyzeCategory,
  IPayloadForFindRaportsToAnalyse,
  ISellerDataForDataAnalysis,
} from "../../types/DataAnalysis.types";
import ReportForAnalysisModel, {
  IReportForAnalysis,
} from "./raportForAnalysis.model";

import UserModel, { IUser } from "./user.model";

export interface IDataAnalysisDocumentPattern {
  owner: string;
  category: string;
  daysRaports: Array<string>;
  arraysOfSellersToCheck: Array<string>;
  usernameToUseAsReference: string;
  informationAreCollec: boolean;
}

export interface IDataAnalysisDocument
  extends Document,
    IDataAnalysisDocumentPattern {}

export interface IDataDocumentModel extends Model<IDataAnalysisDocument> {
  createDataAnalysisDocument(
    dataForCreateDocument: IPayloadForAnalyzeCategory,
    firsRaport: Array<ISellerDataForDataAnalysis>
  ): Promise<void>;

  addRaportToDocument(
    ownerId: string,
    documentId: string,
    dataToAdd: Array<ISellerDataForDataAnalysis>
  ): Promise<void>;
  getDocument(userId: string, _id: string): Promise<IDataAnalysisDocument>;
  getAllDocumentsForWatcher(): Promise<
    Array<IDataWithInformationAboutSavedRaport>
  >;
  deleteDocument(userId: string, documentId: string): Promise<void>;
  getRaportsForDataAnalysis(
    userId: string,
    payloadForFindRaports: IPayloadForFindRaportsToAnalyse
  ): Promise<Array<IReportForAnalysis>>;
}

const getUserFromDbAndThrowErrIfNotExist = async (userId: string) => {
  const owner: IUser = await UserModel.findById(userId);
  if (!owner) {
    throw Error("No user with given ID!");
  }
  return owner;
};

const dataAnalysisReportSchema: Schema = new Schema({
  owner: { type: Schema.Types.ObjectId, ref: "User" },
  category: { type: String, required: true },
  daysRaports: {
    type: [{ type: Schema.Types.ObjectId, ref: "ReportForAnalysis" }],
  },
  arraysOfSellersToCheck: { type: [String], required: true },
  usernameToUseAsReference: { type: String, required: true },
  informationAreCollec: { type: Boolean, required: true },
});

dataAnalysisReportSchema.statics.getAllDocumentsForWatcher = async function () {
  const documents: Array<IDataAnalysisDocument> = await this.find();
  const arrayToReturn: Array<IDataWithInformationAboutSavedRaport> = [];
  for (const raport of documents) {
    arrayToReturn.push({
      owner: raport.owner,
      category: raport.category,
      _id: raport._id,
    });
    raport.informationAreCollec = true;
    await raport.save();
  }

  return arrayToReturn;
};

dataAnalysisReportSchema.statics.createDataAnalysisDocument = async function (
  dataForCreateDocument: IPayloadForAnalyzeCategory,
  firstRaport: Array<ISellerDataForDataAnalysis>
) {
  try {
    const {
      userId,
      arraysOfSellersToCheck,
      category,
      username,
    } = dataForCreateDocument;

    const user: IUser = await getUserFromDbAndThrowErrIfNotExist(userId);
    const dataToSave: IDataAnalysisDocumentPattern = {
      arraysOfSellersToCheck,
      daysRaports: [],
      owner: user._id,
      category,
      usernameToUseAsReference: username,
      informationAreCollec: false,
    };
    const entry = await this.create(dataToSave);
    const { _id } = await entry.save();
    const raportId = await ReportForAnalysisModel.createRaport(
      _id,
      firstRaport
    );
    const document: IDataAnalysisDocument = await this.findById(_id);
    document.daysRaports.push(raportId);
    await document.save();
  } catch (err) {
    console.log(err);
  }
};

dataAnalysisReportSchema.statics.getDocument = async function (
  userId: string,
  _id: string
) {
  const user = await getUserFromDbAndThrowErrIfNotExist(userId);
  const document = await this.findOne({
    _id: _id,
    owner: user._id.toString(),
  });
  if (!document) {
    throw Error("Document with given id not exits");
  }
  return document;
};

dataAnalysisReportSchema.statics.addRaportToDocument = async function (
  ownerId: string,
  documentId: string,
  dataToAdd: Array<ISellerDataForDataAnalysis>
) {
  const documentToAddRaport: IDataAnalysisDocument = await this.findOne({
    owner: ownerId.toString(),
    _id: documentId.toString(),
  });
  if (!documentToAddRaport) {
    throw Error("Document with given Id and owner not exist");
  }
  const reportId = await ReportForAnalysisModel.createRaport(
    documentId,
    dataToAdd
  );

  documentToAddRaport.daysRaports.push(reportId);
  documentToAddRaport.informationAreCollec = false;
  await documentToAddRaport.save();
};

dataAnalysisReportSchema.statics.getRaportsForDataAnalysis = async function (
  userId: string,
  payloadForFindRaports: IPayloadForFindRaportsToAnalyse
) {
  const { documentId, _idFrom, _idTo } = payloadForFindRaports;

  await getUserFromDbAndThrowErrIfNotExist(userId);
  const document: IDataAnalysisDocument = await this.findOne({
    _id: documentId,
    owner: userId,
  });
  if (!document) {
    throw Error("Document with given id not exits");
  }
  if (
    !document.daysRaports.includes(_idFrom) ||
    !document.daysRaports.includes(_idTo)
  ) {
    throw Error("Document don t have raports with given id");
  }
  return await ReportForAnalysisModel.getRaports(payloadForFindRaports);
};

dataAnalysisReportSchema.statics.deleteDocument = async function (
  userId: string,
  documentId: string
) {
  const documentToDelete: IDataAnalysisDocument = await this.findOne({
    owner: userId.toString(),
    _id: documentId.toString(),
  });
  if (!documentToDelete) {
    throw Error("Document with given Id and owner not exist");
  }
  if (documentToDelete.informationAreCollec) {
    throw Error("Document with given Id is collecting data. Try later");
  }
  await ReportForAnalysisModel.deleteRaportsForGivenDocument(documentId);
  await this.findByIdAndDelete(documentId);
};

const DataAnalysisDocumentModel = model<
  IDataAnalysisDocument,
  IDataDocumentModel
>("DataAnalysisDocument", dataAnalysisReportSchema);

export default DataAnalysisDocumentModel;

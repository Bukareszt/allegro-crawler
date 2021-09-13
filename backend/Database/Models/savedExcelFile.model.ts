import { model, Schema, Document, Model } from "mongoose";
import { ISavedExcelFileDataForFrontend } from "../../types/UserLogic.types";

import UserModel, { IUser } from "./user.model";

export interface ISavedExcelFilePattern {
  owner: string;
  title: string;
  idOfFile: string;
}

export interface ISavedExcelFile extends Document, ISavedExcelFilePattern {}

export interface ISavedExcelFileModel extends Model<ISavedExcelFile> {
  createExcelFileInfo(
    userId: string,
    idOfFile: string,
    title: string
  ): Promise<void>;
  getFileInfo(userId: string, id: string): Promise<ISavedExcelFile>;
  getAllExcelFilesForGivenUser(userId: string): Promise<Array<ISavedExcelFile>>;
  getExcelFilesDataForFrontend(
    userId: string
  ): Promise<Array<ISavedExcelFileDataForFrontend>>;
  deleteAllExcelFilesForGivenUser(
    userId: string
  ): Promise<Array<ISavedExcelFile>>;
  deleteExcelFile(userId: string, id: string): Promise<ISavedExcelFile>;
}

const getUserFromDb = async (userId: string) => {
  const owner: IUser = await UserModel.findById(userId);
  if (!owner) {
    throw Error("No user with given ID!");
  }
  return owner;
};

const checkIsOwnerOfResource = async (owner: IUser, resourceId: string) => {
  if (!owner.idsOfSavedDocuments.includes(resourceId)) {
    throw Error("User with given Id is not owner of this resource!");
  }
};

const checkIsResourceExist = async (excelFile: ISavedExcelFile) => {
  if (!excelFile) {
    throw Error("No saved resource with given ID!");
  }
};

const SavedExcelFileSchema: Schema = new Schema({
  owner: { type: Schema.Types.ObjectId, ref: "User" },
  title: { type: String, required: true },
  idOfFile: { type: String, required: true },
});

SavedExcelFileSchema.statics.createExcelFileInfo = async function (
  userId: string,
  idOfFile: string,
  title: string
) {
  const owner: IUser = await getUserFromDb(userId);

  if (owner.idsOfSavedDocuments.includes(idOfFile)) {
    return;
  }

  const objectToCreate: ISavedExcelFilePattern = {
    owner: userId,
    title: title,
    idOfFile: idOfFile,
  };

  const entry = await this.create(objectToCreate);

  await entry.save();

  owner.idsOfSavedDocuments.push(entry._id);

  await owner.save();
};

SavedExcelFileSchema.statics.getFileInfo = async function (
  userId: string,
  id: string
) {
  try {
    const owner: IUser = await getUserFromDb(userId);

    const result = await this.findById(id);
    checkIsResourceExist(result);
    checkIsOwnerOfResource(owner, id);

    return result;
  } catch (err) {
    throw err;
  }
};

SavedExcelFileSchema.statics.getAllExcelFilesForGivenUser = async function (
  userId: string
) {
  try {
    const owner: IUser = await getUserFromDb(userId);
    const result: Array<ISavedExcelFile> = await this.find({ owner: userId });

    return result;
  } catch (err) {
    throw err;
  }
};
SavedExcelFileSchema.statics.getExcelFilesDataForFrontend = async function (
  userId: string
) {
  const result: Array<ISavedExcelFile> = await this.find({ owner: userId });
  const resultArray: Array<ISavedExcelFileDataForFrontend> = [];
  for (const excelFileInfo of result) {
    const excelInfoForFronetend: ISavedExcelFileDataForFrontend = {
      _id: excelFileInfo._id,
      title: excelFileInfo.title,
    };
    resultArray.push(excelInfoForFronetend);
  }

  return resultArray;
};

SavedExcelFileSchema.statics.deleteAllExcelFilesForGivenUser = async function (
  userId: string
) {
  const owner: IUser = await getUserFromDb(userId);

  const entries: Array<ISavedExcelFile> = await this.find({
    owner: userId,
  });

  const result = await this.deleteMany({ owner: userId });

  owner.idsOfSavedDocuments = [];

  await owner.save();

  return entries;
};

SavedExcelFileSchema.statics.deleteExcelFile = async function (
  userId: string,
  id: string
) {
  const owner: IUser = await getUserFromDb(userId);

  const entry: ISavedExcelFile = await this.findByIdAndDelete(id);
  checkIsResourceExist(entry);

  owner.idsOfSavedDocuments = owner.idsOfSavedDocuments.filter(
    (idOfSavedDoc) => {
      return idOfSavedDoc != id;
    }
  );

  await owner.save();

  return entry;
};

const SavedExcelFileModel = model<ISavedExcelFile, ISavedExcelFileModel>(
  "SavedExcelFile",
  SavedExcelFileSchema
);

export default SavedExcelFileModel;

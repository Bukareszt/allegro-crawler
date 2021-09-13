import { model, Schema, Document, Model } from "mongoose";
import {
  ICrawlerArgumentsWithCrawlerName,
  SortOptions,
} from "../../types/Crawler.types";
import { ISavedCrawlingConfigurationForFrontend } from "../../types/UserLogic.types";

import UserModel, { IUser } from "./user.model";

export interface ICrawlingConfigurationPattern {
  nameOfCrawler: string;
  owner: string;
  category: string;
  countOfProductsToCheck: number;
  sortBy: SortOptions;
  sellersLogins: Array<string>;
  deepSearch: boolean;
  saveFile: boolean;
}

export interface ICrawlingConfiguration
  extends Document,
    ICrawlingConfigurationPattern {}

interface ICrawlingConfigurationModel extends Model<ICrawlingConfiguration> {
  getConfiguration(
    userId: string,
    crawlingId: string
  ): Promise<ICrawlerArgumentsWithCrawlerName>;
  getConfigurationsDataForFrontend(
    userId: string
  ): Promise<Array<ISavedCrawlingConfigurationForFrontend>>;

  createConfiguration(
    userId: string,
    crawlerConfiguration: ICrawlerArgumentsWithCrawlerName
  ): Promise<string>;
  editConfiguration(
    userId: string,
    crawlingId: string,
    newCrawlerConfiguration: ICrawlerArgumentsWithCrawlerName
  ): Promise<void>;
  deleteConfiguration(userId: string, crawlingId: string): Promise<void>;
  deleteAllConfigurationsForGivenUser(userId: string): Promise<void>;
}

export const crawlingConfigurationSchema: Schema = new Schema({
  owner: { type: Schema.Types.ObjectId, ref: "User" },
  nameOfCrawler: { type: String, required: true },
  category: { type: String, required: true },
  countOfProductsToCheck: { type: Number, required: true },
  sortBy: {
    type: String,
    enum: Object.values(SortOptions),
    default: SortOptions.popularityDescending,
    required: true,
  },
  sellersLogins: { type: [String], required: true },
  deepSearch: { type: Boolean, required: true },
  saveFile: { type: Boolean, required: true },
});

const getUserFromDb = async (userId: string) => {
  const owner: IUser = await UserModel.findById(userId);
  if (!owner) {
    throw Error("No user with given ID!");
  }
  return owner;
};

const checkIsOwnerOfResource = async (owner: IUser, resourceId: string) => {
  if (!owner.savedConfigurationsOfCrawling.includes(resourceId)) {
    console.log(owner.savedConfigurationsOfCrawling, resourceId);
    throw Error("User with given Id is not owner of this resource!");
  }
};

const checkIsResourceExist = async (
  crawlingConfigInstance: ICrawlingConfiguration
) => {
  if (!crawlingConfigInstance) {
    throw Error("No saved resource with given ID!");
  }
};

crawlingConfigurationSchema.statics.getConfiguration = async function (
  userId: string,
  crawlingId: string
) {
  const owner: IUser = await getUserFromDb(userId);

  const crawlingConfigInstance: ICrawlingConfiguration = await this.findById(
    crawlingId
  );

  checkIsResourceExist(crawlingConfigInstance);
  checkIsOwnerOfResource(owner, crawlingId);

  return crawlingConfigInstance;
};

crawlingConfigurationSchema.statics.getConfigurationsDataForFrontend = async function (
  userId: string
) {
  const entry: Array<ICrawlingConfiguration> = await this.find({
    owner: userId,
  });
  const resultArr: Array<ISavedCrawlingConfigurationForFrontend> = [];
  for (const savedConfig of entry) {
    const savedConfigDataForFrontend: ISavedCrawlingConfigurationForFrontend = {
      nameOfCrawler: savedConfig.nameOfCrawler,
      category: savedConfig.category,
      saveFile: savedConfig.saveFile,
      _id: savedConfig._id,
      sellersLogins: savedConfig.sellersLogins,
      sortBy: savedConfig.sortBy,
      deepSearch: savedConfig.deepSearch,
      countOfProductsToCheck: savedConfig.countOfProductsToCheck,
    };
    resultArr.push(savedConfigDataForFrontend);
  }
  return resultArr;
};

crawlingConfigurationSchema.statics.createConfiguration = async function (
  userId: string,
  crawlerConfiguration: ICrawlerArgumentsWithCrawlerName
): Promise<void> {
  const owner: IUser = await getUserFromDb(userId);

  const { _id } = await this.create({
    nameOfCrawler: crawlerConfiguration.nameOfCrawler,
    category: crawlerConfiguration.category,
    countOfProductsToCheck: crawlerConfiguration.countOfProductsToCheck,
    sortBy: crawlerConfiguration.sortBy,
    sellersLogins: crawlerConfiguration.sellersLogins,
    deepSearch: crawlerConfiguration.deepSearch,
    owner: owner._id,
    saveFile: crawlerConfiguration.saveFile,
  });

  owner.savedConfigurationsOfCrawling.push(_id);

  await owner.save();
  return _id;
};

crawlingConfigurationSchema.statics.editConfiguration = async function (
  userId: string,
  crawlingId: string,
  newCrawlerConfiguration: ICrawlerArgumentsWithCrawlerName
) {
  const owner: IUser = await getUserFromDb(userId);

  const crawlingConfigInstance: ICrawlingConfiguration = await this.findById(
    crawlingId
  );

  checkIsOwnerOfResource(owner, crawlingId);
  checkIsResourceExist(crawlingConfigInstance);

  Object.keys(newCrawlerConfiguration).forEach((key) => {
    crawlingConfigInstance[key] = newCrawlerConfiguration[key];
  });

  await crawlingConfigInstance.save();
};

crawlingConfigurationSchema.statics.deleteConfiguration = async function (
  userId: string,
  crawlingId: string
) {
  const owner: IUser = await getUserFromDb(userId);

  const crawlingConfigInstance: ICrawlingConfiguration = await this.findById(
    crawlingId
  );

  checkIsResourceExist(crawlingConfigInstance);
  checkIsOwnerOfResource(owner, crawlingId);

  owner.savedConfigurationsOfCrawling.splice(
    owner.savedConfigurationsOfCrawling.indexOf(crawlingConfigInstance._id),
    1
  );

  await owner.save();

  await this.findByIdAndRemove(crawlingId);
};

crawlingConfigurationSchema.statics.deleteAllConfigurationsForGivenUser = async function (
  userId: string
) {
  const owner: IUser = await getUserFromDb(userId);

  await this.deleteMany({ owner: owner._id });

  owner.savedConfigurationsOfCrawling = [];

  await owner.save();
};

const CrawlingConfigurationModel = model<
  ICrawlingConfiguration,
  ICrawlingConfigurationModel
>("CrawlingConfiguration", crawlingConfigurationSchema);

export default CrawlingConfigurationModel;

import { model, Schema, Document, Model } from "mongoose";
import {
  ICrawlerArgumentsWithCrawlerName,
  SortOptions,
} from "../../types/Crawler.types";
import { ITimeDataForDailyCrawling } from "../../types/DailyCrawling.types";
import { ISavedDailyCrawlingsForFrontend } from "../../types/UserLogic.types";
import UserModel, { IUser } from "./user.model";

export interface IDailyCrawlingPattern {
  crawlerArguments: ICrawlerArgumentsWithCrawlerName;
  hourOfCrawling: number;
  minuteOfCrawling: number;
  owner: string;
  isStopped: boolean;
}

export interface IDailyCrawling extends Document, IDailyCrawlingPattern {}

export interface IDailyCrawlingModel extends Model<IDailyCrawling> {
  getAllDailyCrawlingForGivenUser(
    userId: string
  ): Promise<Array<IDailyCrawling>>;
  getDailyCrawlingDataForFrontend(
    userId: string
  ): Promise<Array<ISavedDailyCrawlingsForFrontend>>;
  addDailyCrawling(
    userId: string,
    crawlerArguments: ICrawlerArgumentsWithCrawlerName,
    timeArguments: ITimeDataForDailyCrawling
  ): Promise<IDailyCrawling>;
  updateDailyCrawling(
    ownerId: string,
    crawlerId: string,
    crawlerArguments: ICrawlerArgumentsWithCrawlerName,
    timeArguments: ITimeDataForDailyCrawling
  ): Promise<IDailyCrawling>;
  startDailyCrawling(
    ownerId: string,
    crawlingId: string
  ): Promise<IDailyCrawling>;
  stopDailyCrawling(
    ownerId: string,
    crawlingId: string
  ): Promise<IDailyCrawling>;
  deleteDailyCrawling(
    ownerId: string,
    crawlingId: string
  ): Promise<IDailyCrawling>;
  deleteAllDailyCrawlingsForGivenUser(
    userId: string
  ): Promise<Array<IDailyCrawling>>;
}
const configurationOfCrawling: Schema = new Schema(
  {
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
  },
  { _id: false }
);

const DailyCrawlingSchema: Schema = new Schema({
  crawlerArguments: {
    type: configurationOfCrawling,
    required: true,
  },
  hourOfCrawling: { type: Number, required: true },
  minuteOfCrawling: { type: Number, required: true },
  isStopped: { type: Boolean, required: true },
  owner: { type: Schema.Types.ObjectId, ref: "User" },
});

const getUserFromDb = async (userId: string) => {
  const owner: IUser = await UserModel.findById(userId);
  if (!owner) {
    throw Error("No user with given ID!");
  }
  return owner;
};

const checkIsOwnerOfResource = async (owner: IUser, resourceId: string) => {
  if (!owner.savedDailyCrawling.includes(resourceId)) {
    throw Error("User with given Id is not owner of this resource!");
  }
};

const checkIsResourceExist = async (dailyCrawlingInstance: IDailyCrawling) => {
  if (!dailyCrawlingInstance) {
    throw Error("No saved resource with given ID!");
  }
};

DailyCrawlingSchema.statics.getDailyCrawlingDataForFrontend = async function (
  userId: string
) {
  const entry: Array<IDailyCrawling> = await this.find({ owner: userId });
  const arrayToReturn: Array<ISavedDailyCrawlingsForFrontend> = [];
  for (const crawlingData of entry) {
    const crawlingDataForFrontend: ISavedDailyCrawlingsForFrontend = {
      _id: crawlingData._id,
      timeArguments: {
        hourOfCrawling: crawlingData.hourOfCrawling,
        minuteOfCrawling: crawlingData.minuteOfCrawling,
      },
      crawlerArguments: crawlingData.crawlerArguments,
      isStopped: crawlingData.isStopped,
    };
    arrayToReturn.push(crawlingDataForFrontend);
  }

  return arrayToReturn;
};

DailyCrawlingSchema.statics.getAllDailyCrawlingForGivenUser = async function (
  userId: string
) {
  const owner: IUser = await getUserFromDb(userId);

  const userCrawlings: Array<IDailyCrawling> = await this.find({
    owner: owner,
  });
  return userCrawlings;
};

DailyCrawlingSchema.statics.addDailyCrawling = async function (
  userId: string,
  crawlerArguments: ICrawlerArgumentsWithCrawlerName,
  timeArguments: ITimeDataForDailyCrawling
) {
  const owner: IUser = await getUserFromDb(userId);

  const crawlingToAdd: IDailyCrawlingPattern = {
    crawlerArguments: crawlerArguments,
    hourOfCrawling: timeArguments.hourOfCrawling,
    minuteOfCrawling: timeArguments.minuteOfCrawling,
    owner: userId,
    isStopped: false,
  };
  const entry = new this(crawlingToAdd);
  const result = await entry.save();

  owner.savedDailyCrawling.push(result._id);
  await owner.save();

  return result;
};

DailyCrawlingSchema.statics.updateDailyCrawling = async function (
  userId: string,
  crawlerId: string,
  crawlerArguments: ICrawlerArgumentsWithCrawlerName,
  timeArguments: ITimeDataForDailyCrawling
) {
  const owner: IUser = await getUserFromDb(userId);

  const dailyCrawling: IDailyCrawling = await this.findById(crawlerId);

  checkIsResourceExist(dailyCrawling);

  checkIsOwnerOfResource(owner, crawlerId);

  dailyCrawling.hourOfCrawling = timeArguments.hourOfCrawling;
  dailyCrawling.minuteOfCrawling = timeArguments.minuteOfCrawling;
  dailyCrawling.crawlerArguments = crawlerArguments;

  await dailyCrawling.save();

  return dailyCrawling;
};

DailyCrawlingSchema.statics.startDailyCrawling = async function (
  userId: string,
  crawlerId: string
) {
  const owner: IUser = await getUserFromDb(userId);

  const dailyCrawlingInstance: IDailyCrawling = await this.findById(crawlerId);

  checkIsResourceExist(dailyCrawlingInstance);

  checkIsOwnerOfResource(owner, crawlerId);

  dailyCrawlingInstance.update({ isStopped: false });
  await dailyCrawlingInstance.save();

  return dailyCrawlingInstance;
};

DailyCrawlingSchema.statics.stopDailyCrawling = async function (
  userId: string,
  crawlerId: string
) {
  const owner: IUser = await getUserFromDb(userId);

  const dailyCrawlingInstance: IDailyCrawling = await this.findById(crawlerId);

  checkIsResourceExist(dailyCrawlingInstance);

  checkIsOwnerOfResource(owner, crawlerId);

  dailyCrawlingInstance.update({ isStopped: true });

  await dailyCrawlingInstance.save();

  return dailyCrawlingInstance;
};

DailyCrawlingSchema.statics.deleteAllDailyCrawlingsForGivenUser = async function (
  userId: string
) {
  await UserModel.findByIdAndUpdate(userId, { savedDailyCrawling: [] });
  const entries = await this.find({ owner: userId });
  await this.deleteMany({ owner: userId });

  return entries;
};

DailyCrawlingSchema.statics.deleteDailyCrawling = async function (
  userId: string,
  crawlerId: string
) {
  const owner: IUser = await getUserFromDb(userId);

  const dailyCrawlingInstance: IDailyCrawling = await this.findById(crawlerId);

  checkIsResourceExist(dailyCrawlingInstance);

  checkIsOwnerOfResource(owner, crawlerId);

  owner.savedDailyCrawling.filter(
    (crawlingIdOfInstanceToDelete) => crawlingIdOfInstanceToDelete != crawlerId
  );

  await this.findByIdAndDelete(dailyCrawlingInstance._id);

  await owner.save();

  return dailyCrawlingInstance;
};

const DailyCrawlingModel = model<IDailyCrawling, IDailyCrawlingModel>(
  "DailyCrawling",
  DailyCrawlingSchema
);

export default DailyCrawlingModel;

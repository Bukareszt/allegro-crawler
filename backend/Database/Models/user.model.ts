import { model, Schema, Document, Model } from "mongoose";
import { SortOptions } from "../../types/Crawler.types";
import moment from "moment";
import {
  IAmountOfCrawlingOverMonth,
  IDataForCrawlerLimitation,
  ISavedCrawlingConfigurationForFrontend,
  ISavedDailyCrawlingsForFrontend,
  ISavedExcelFileDataForFrontend,
  ISubscriptionAccountData,
  IUserDataForFrontend,
} from "../../types/UserLogic.types";
import DailyCrawlingModel from "./dailyCrawling.model";
import CrawlingConfigurationModel from "./crawlingConfiguration.model";
import SavedExcelFileModel from "./savedExcelFile.model";

export interface IUserPattern {
  email: string;
  amountOfCrawlingOverMonth: IAmountOfCrawlingOverMonth;
  subscriptionAccountInformation: ISubscriptionAccountData;
  searchedPhrases: Array<string>;
  savedDailyCrawling: Array<string>;
  savedConfigurationsOfCrawling: Array<string>;
  idsOfSavedDocuments: Array<string>;
}

export interface IUser extends Document, IUserPattern {}

interface IUserModel extends Model<IUser> {
  createUser(email: string): Promise<void>;
  getUserData(email: string): Promise<IUserDataForFrontend>;

  getSavedPhrases(id: string): Promise<Array<string>>;
  getUserDataForHandleCrawlingLimitation(
    id: string
  ): Promise<IDataForCrawlerLimitation>;
  changeMonthAndAmountOfCrawling(id: string): Promise<void>;

  userHaveSubscription(id: string): Promise<boolean>;
  addSubscriptionWithStripeCustomerId(
    id: string,
    stripeCustomerId: string
  ): Promise<void>;
  deleteSubscription(id: string): Promise<void>;

  checkIsUserExist(id: string): Promise<void>;

  saveSearchedPhraseAndIncrementAmountOfCrawling(
    id: string,
    phrase: string
  ): Promise<void>;

  deleteUser(id: string): Promise<IUser>;
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

const UserSchema: Schema = new Schema({
  uniqueId: { type: String, required: false },
  email: { type: String, required: true },
  subscriptionAccountInformation: {
    haveSubscription: { type: Boolean, required: true },
    stripeCustomerId: { type: String, required: false },
  },
  amountOfCrawlingOverMonth: {
    month: { type: String, required: true },
    amount: { type: Number, required: true },
  },
  searchedPhrases: { type: [String], required: true },
  savedConfigurationsOfCrawling: [
    { type: Schema.Types.ObjectId, ref: "CrawlingConfiguration" },
  ],
  savedDailyCrawling: [{ type: Schema.Types.ObjectId, ref: "DailyCrawling" }],
  idsOfSavedDocuments: [
    { type: { type: Schema.Types.ObjectId, ref: "SavedExcelFile" } },
  ],
});

UserSchema.statics.createUser = async function (email: string): Promise<void> {
  const userWithHashedPassword: IUserPattern = {
    email: email,
    amountOfCrawlingOverMonth: {
      amount: 0,
      month: moment().format("MMMM"),
    },
    savedDailyCrawling: [],
    subscriptionAccountInformation: {
      haveSubscription: false,
      stripeCustomerId: "",
    },
    searchedPhrases: [],
    savedConfigurationsOfCrawling: [],
    idsOfSavedDocuments: [],
  };
  const entry = new this(userWithHashedPassword);

  await entry.save();
};

UserSchema.statics.getUserData = async function (
  email: string
): Promise<IUserDataForFrontend> {
  const { _id, searchedPhrases } = await this.findOne({ email: email });
  const savedExcelfiles: Array<ISavedExcelFileDataForFrontend> = await SavedExcelFileModel.getExcelFilesDataForFrontend(
    _id
  );
  const savedDailyCrawlingsData: Array<ISavedDailyCrawlingsForFrontend> = await DailyCrawlingModel.getDailyCrawlingDataForFrontend(
    _id
  );

  const savedCrawlerConfigurations: Array<ISavedCrawlingConfigurationForFrontend> = await CrawlingConfigurationModel.getConfigurationsDataForFrontend(
    _id
  );

  const returnData: IUserDataForFrontend = {
    savedDailyCrawlings: savedDailyCrawlingsData,
    savedConfigurationsOfCrawling: savedCrawlerConfigurations,
    savedFiles: savedExcelfiles,
    searchedPhrases: searchedPhrases,
  };

  return returnData;
};

UserSchema.statics.getUserDataForHandleCrawlingLimitation = async function (
  userId: string
) {
  const user: IUser = await this.findById(userId);
  if (!user) {
    throw Error("No user with given Id!");
  }
  const informationAboutCrawlingLimitation: IDataForCrawlerLimitation = {
    amountOfCrawlingOverMonth: user.amountOfCrawlingOverMonth,
    subscriptionAccountInformation: user.subscriptionAccountInformation,
  };
  return informationAboutCrawlingLimitation;
};

UserSchema.statics.getSavedPhrases = async function (
  userId: string
): Promise<Array<string>> {
  const user: IUser = await this.findById(userId);
  if (!user) {
    throw Error("No user with given Id!");
  }
  return user.searchedPhrases;
};

UserSchema.statics.saveSearchedPhraseAndIncrementAmountOfCrawling = async function (
  userId: string,
  searchedPhrase: string
): Promise<void> {
  const user: IUser = await this.findById(userId);
  if (!user) {
    throw Error("No user with given Id!");
  }
  if (user.searchedPhrases.indexOf(searchedPhrase) === -1) {
    user.searchedPhrases.push(searchedPhrase);
  }

  user.amountOfCrawlingOverMonth.amount += 1;

  await user.save();
};

UserSchema.statics.changeMonthAndAmountOfCrawling = async function (
  userId: string
) {
  await this.findByIdAndUpdate(userId, {
    amountOfCrawlingOverMonth: {
      amount: 0,
      month: moment().format("MMMM"),
    },
  });
};

UserSchema.statics.checkIsUserExist = async function (userId: string) {
  const user: IUser = await this.findById(userId);
  if (!user) {
    throw Error("No user with given Id!");
  }
};

UserSchema.statics.addSubscriptionWithStripeCustomerId = async function (
  userId: string,
  stripeCustomerId: string
) {
  const user: IUser = await this.findById(userId);
  if (!user) {
    throw Error("No user with given ID!");
  }
  user.subscriptionAccountInformation.stripeCustomerId = stripeCustomerId;
  user.subscriptionAccountInformation.haveSubscription = true;
  await user.save();
};

UserSchema.statics.deleteSubscription = async function (stripeId: string) {
  const user: IUser = await this.find({
    subscriptionAccountInformation: { stripeCustomerId: stripeId },
  });
  if (!user) {
    return;
  }
  user.subscriptionAccountInformation.haveSubscription = false;
  user.subscriptionAccountInformation.stripeCustomerId = "";
  await user.save();
};

UserSchema.statics.userHaveSubscription = async function (userId: string) {
  const user: IUser = await this.findById(userId);
  if (!user) {
    throw Error("No user with given ID!");
  }

  return user.subscriptionAccountInformation.haveSubscription;
};

UserSchema.statics.deleteUser = async function (
  userId: string
): Promise<IUser> {
  const user: IUser = await this.findByIdAndRemove(userId);
  if (!user) {
    throw Error("No user with given Id!");
  }
  return user;
};

const UserModel = model<IUser, IUserModel>("User", UserSchema);

export default UserModel;

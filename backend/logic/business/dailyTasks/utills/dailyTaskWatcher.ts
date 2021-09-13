import cron from "node-cron";
import DailyCrawlingModel, {
  IDailyCrawling,
} from "../../../../Database/Models/dailyCrawling.model";
import UserModel from "../../../../Database/Models/user.model";
import {
  IDailyCrawlingWatcher,
  IDailyCrawlingObject,
  ITimeDataForDailyCrawling,
} from "../../../../types/DailyCrawling.types";

import DailyCrawlingQueueuHandler from "../../../generic/Queue/DailyCrawlingQueueHandler";

export class DailyCrawlingWatcher implements IDailyCrawlingWatcher {
  private listOfCrawlingsToExecute: Array<IDailyCrawlingObject> = [];

  private databaseWatcher: cron.ScheduledTask;
  private dailyCrawlingWatcher: cron.ScheduledTask;

  public async startDailyCrawlingHandler(): Promise<void> {
    this.startDatabaseWatcher();
    this.startDailyCrawlingWatcher();
  }

  public async addDailyCrawling(dailyCrawling: IDailyCrawling): Promise<void> {
    try {
      const { email } = await UserModel.findById(dailyCrawling.owner);
      const { hourOfCrawling, minuteOfCrawling } = dailyCrawling;
      if (
        await this.calculateIsDailyCrawlingShouldBePushToExecuteList(
          dailyCrawling.owner,
          { hourOfCrawling, minuteOfCrawling },
          dailyCrawling.isStopped
        )
      )
        this.listOfCrawlingsToExecute.push(
          this.createDailyCrawlingObject(dailyCrawling, email)
        );
    } catch (err) {
      throw err;
    }
  }

  public deleteDailyCrawling(dailyCrawling: IDailyCrawling): void {
    const dailyCrawlingInstanceToDelete = this.listOfCrawlingsToExecute.find(
      (dailyCrawlingToDelete) =>
        dailyCrawlingToDelete.crawlingConfiguration._id.toString() ===
        dailyCrawling._id.toString()
    );
    if (dailyCrawlingInstanceToDelete) {
      this.listOfCrawlingsToExecute.splice(
        this.listOfCrawlingsToExecute.indexOf(dailyCrawlingInstanceToDelete),
        1
      );
    }
  }

  public deleteDailyAllCrawlingsForGivenUser(
    dailyCrawlings: Array<IDailyCrawling>
  ): void {
    dailyCrawlings.forEach((crawling) => this.deleteDailyCrawling(crawling));
  }

  public async editDailyCrawling(dailyCrawling: IDailyCrawling): Promise<void> {
    try {
      const dailyCrawlingInstanceToEdit = this.listOfCrawlingsToExecute.find(
        (dailyCrawlingToEdit) =>
          dailyCrawlingToEdit.crawlingConfiguration._id.toString() ===
          dailyCrawling._id.toString()
      );
      if (dailyCrawlingInstanceToEdit) {
        this.deleteDailyCrawling(
          dailyCrawlingInstanceToEdit.crawlingConfiguration
        );
        await this.addDailyCrawling(dailyCrawling);
      } else {
        await this.addDailyCrawling(dailyCrawling);
      }
    } catch (err) {
      throw err;
    }
  }

  private startDatabaseWatcher(): void {
    this.databaseWatcher = cron.schedule(`0 0 * * *`, async () => {
      this.listOfCrawlingsToExecute = [];
      await this.getAllSavedDailyCrawlingsFromServer();
    });
  }

  private startDailyCrawlingWatcher(): void {
    this.dailyCrawlingWatcher = cron.schedule("*/5 * * * *", () => {
      const fiveMin = 5;
      const actualDate = new Date();

      for (const savedCrawling of this.listOfCrawlingsToExecute) {
        const difrenceBettweenDatesInMs =
          savedCrawling.dateOfStart.getTime() - actualDate.getTime();
        const minute = 1000 * 60;

        const minutes = difrenceBettweenDatesInMs / minute;

        if (minutes < fiveMin) {
          this.executeDailyCrawling(savedCrawling);
        }
      }
    });
  }

  private executeDailyCrawling(dailyCrawling: IDailyCrawlingObject): void {
    DailyCrawlingQueueuHandler.addToDailyCrawlingQueueu(dailyCrawling);
    this.listOfCrawlingsToExecute.splice(
      this.listOfCrawlingsToExecute.indexOf(dailyCrawling),
      1
    );
  }

  private async getAllSavedDailyCrawlingsFromServer(): Promise<void> {
    const savedDailyCrawlingsList: Array<IDailyCrawling> = await DailyCrawlingModel.find();
    for (const savedCrawling of savedDailyCrawlingsList) {
      const { hourOfCrawling, minuteOfCrawling } = savedCrawling;
      const shouldBePush = await this.calculateIsDailyCrawlingShouldBePushToExecuteList(
        savedCrawling.owner,
        { hourOfCrawling, minuteOfCrawling },
        savedCrawling.isStopped
      );

      if (shouldBePush) {
        const { email } = await UserModel.findById(savedCrawling.owner);

        this.listOfCrawlingsToExecute.push(
          this.createDailyCrawlingObject(savedCrawling, email)
        );
      }
    }
  }

  private async calculateIsDailyCrawlingShouldBePushToExecuteList(
    userId: string,
    timeArguments: ITimeDataForDailyCrawling,
    isStopped: boolean
  ) {
    const dateOfStart = new Date();
    const actualData = Date.now();
    dateOfStart.setHours(timeArguments.hourOfCrawling);
    dateOfStart.setMinutes(timeArguments.minuteOfCrawling);

    const ownerHaveSubscription: boolean = await UserModel.userHaveSubscription(
      userId
    );

    if (isStopped) {
      return false;
    }
    if (!ownerHaveSubscription) {
      return false;
    }

    if (dateOfStart.getTime() < actualData) {
      return false;
    }
    return true;
  }

  private createDailyCrawlingObject(
    crawlingConfiguration: IDailyCrawling,
    email: string
  ): IDailyCrawlingObject {
    const dateOfStart = new Date();
    dateOfStart.setHours(crawlingConfiguration.hourOfCrawling);
    dateOfStart.setMinutes(crawlingConfiguration.minuteOfCrawling);
    return { email, crawlingConfiguration, dateOfStart };
  }
}

import nodemailer from "nodemailer";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import { IEmailHandler } from "../../../../types/Crawler.types";

dotenv.config();

export default class EmailHandler implements IEmailHandler {
  private pathToExcelFile = path.join(__dirname, "../../WorkFiles/");
  private excelFileEnd = ".xlsx";

  private transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_LOGIN,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  public sendEmailWithExcelFile(
    email: string,
    phrase: string,
    documentId: string
  ): Promise<any> {
    const emailOptions = {
      from: process.env.EMAIL_LOGIN,
      to: email,
      subject: "Data from Allegro Crawler!",
      text: "Hello! Your Excel is ready.",
      attachments: [
        {
          filename: `AllegroCrawler-${phrase}.xlsx`,
          content: fs.createReadStream(
            this.pathToExcelFile + documentId + this.excelFileEnd
          ),
        },
      ],
    };

    return this.transporter.sendMail(emailOptions).catch((err) => {
      console.log(err);
      throw Error("Problem with sending email to client!");
    });
  }

  public async sendEmailWithInformationAboutError(
    email: string,
    error: string
  ): Promise<void> {
    try {
      await this.sendEmailWithInformationAboutErrorForDeveloper(error);
      await this.sendEmailWithInformationAboutErrorForClient(email);
    } catch (err) {
      console.log(err);
      throw Error("Problem with sending emails about Error!");
    }
  }

  public async sendEmailWithInformationAboutErrorForDeveloper(error: string) {
    try {
      const emailOptionsForOwner = {
        from: process.env.EMAIL_LOGIN,
        to: process.env.EMAIL_LOGIN,
        subject: "Allegro Crawler - Error!",
        text: `Something went wrong! Error: ${error} `,
      };
      return await this.transporter.sendMail(emailOptionsForOwner);
    } catch (err) {
      console.log(err);
      throw err;
    }
  }
  private async sendEmailWithInformationAboutErrorForClient(email: string) {
    try {
      const emailOptionsForClient = {
        from: process.env.EMAIL_LOGIN,
        to: email,
        subject: "Allegro Crawler - Error!",
        text:
          "Hello! Something went wrong. Sorry, we are trying to fix the problem",
      };
      await this.transporter.sendMail(emailOptionsForClient);
    } catch (err) {
      console.log(err);
      throw err;
    }
  }
}

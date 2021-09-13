import nodeFetch from "node-fetch";
import fs from "fs";
import path from "path";

import dotenv from "dotenv";
import { ITokenDataFromAllegro } from "../../../../../types/Crawler.types";

dotenv.config();

export default class TokenHandler {
  private allegroConstatnUrlForTokenRequest: string =
    "https://allegro.pl/auth/oauth/token?grant_type=client_credentials";

  private pathToTokenFile: string = path.join(__dirname, "/token.json");

  public async getToken(): Promise<string> {
    try {
      const tokenFromFile = this.getTokenIfNotExpired();
      if (!tokenFromFile) {
        const newToken = await this.getTokenDataFromAllegro();
        return newToken;
      }
      return tokenFromFile;
    } catch (err) {
      throw err;
    }
  }

  private getTokenIfNotExpired(): string | void {
    if (!fs.existsSync(this.pathToTokenFile)) {
      return;
    }
    const rawTokenData: string = fs.readFileSync(this.pathToTokenFile, "utf-8");
    const tokenData: ITokenDataFromAllegro = JSON.parse(rawTokenData);
    if (tokenData.expiration_date < Date.now()) {
      return;
    }
    return tokenData.access_token;
  }

  private getTokenDataFromAllegro(): Promise<string> {
    return this.requestTokenDataFromAllegro()
      .then((tokenObjectFromAllegro: ITokenDataFromAllegro) => {
        return this.setExpirationDateOfTokenAndSaveToFile(
          tokenObjectFromAllegro
        );
      })
      .catch((err) => {
        throw err;
      });
  }

  private requestTokenDataFromAllegro(): Promise<ITokenDataFromAllegro> {
    const data = this.encodAuthorizationDataToBase64();
    return nodeFetch(this.allegroConstatnUrlForTokenRequest, {
      method: "post",
      headers: {
        Authorization: data,
      },
    })
      .then((rawDatafromAllegro) => {
        return rawDatafromAllegro.json();
      })
      .catch((err) => {
        throw new Error(
          "Problem with authorization request to Allegro. Check .env file, and internet connection"
        );
      });
  }

  private encodAuthorizationDataToBase64(): string {
    const clientId = process.env.ALLEGRO_CLIENT_ID;
    const clientSecret = process.env.ALLEGRO_CLIENT_SECRET;
    if (!clientId || !clientSecret) {
      throw new Error("No data in ENV file! Add allegro credentials data");
    }
    const encodedAuthorizationData =
      "Basic " +
      Buffer.from(
        process.env.ALLEGRO_CLIENT_ID + ":" + process.env.ALLEGRO_CLIENT_SECRET
      ).toString("base64");
    return encodedAuthorizationData;
  }

  private setExpirationDateOfTokenAndSaveToFile(
    token: ITokenDataFromAllegro
  ): string {
    token.expiration_date = Date.now() + token.expires_in * 1000;
    const tokenToSave = JSON.stringify(token, null, 2);
    fs.writeFileSync(this.pathToTokenFile, tokenToSave);
    return token.access_token;
  }
}

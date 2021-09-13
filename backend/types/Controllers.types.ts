import { Request, Response } from "express";

export interface IResponseMsg {
  message: string;
  errorMsg?: string | Array<string>;
}

export interface IResponseMsgWithData<T> {
  message: string;
  data: T;
}

export interface IAuthController {
  generateToken(req: Request, res: Response): void;
  registerUser(req: Request, res: Response): Promise<void>;
  failedRequest(req: Request, res: Response): void;
  vertifyUser(req: Request, res: Response): Promise<void>;
}

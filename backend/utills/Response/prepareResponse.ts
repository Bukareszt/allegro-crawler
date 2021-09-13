import {
  IResponseMsg,
  IResponseMsgWithData,
} from "../../types/Controllers.types";

export default function prepareResponse(
  message: string,
  errMsg?: string | Array<string>
): IResponseMsg {
  if (errMsg) {
    return { message: message, errorMsg: errMsg };
  }
  return { message: message };
}

export function prepareResponseWithData<T>(
  message: string,
  data: T
): IResponseMsgWithData<T> {
  return { message: message, data: data };
}

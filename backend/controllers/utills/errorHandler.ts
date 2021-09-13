import { IResponseMsg } from "../../types/Controllers.types";
import prepareResponse from "../../utills/Response/prepareResponse";

const handleError = async (req, res, next) => {
  try {
    await next();
  } catch (err) {
    console.log(err);
    const responseObject: IResponseMsg = prepareResponse(
      "Bad request! Check error message!",
      err.message
    );
    return res.status(400).json(responseObject);
  }
};

export default handleError;

import { Response } from "express";
import httpCode from "./httpCode";

export const formatOkMessage = (response: Response): void => {
  formatReturnedMessage(response, httpCode.OK, "OK");
};

export const formatInternalServerErrorMessage = (response: Response): void => {
  formatReturnedMessage(
    response,
    httpCode.INTERNAL_SERVER_ERROR,
    "Internal server error"
  );
};

export type AnyType = string | Record<string, unknown> | unknown[];

export const formatReturnedMessage = (
  response: Response,
  code: number,
  message: AnyType,
  details: AnyType | undefined = undefined
): void => {
  response.status(code).json({
    response: message,
    details: details,
  });
};

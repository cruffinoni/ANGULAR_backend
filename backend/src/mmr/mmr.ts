import { Route, SubRouter } from "../server/api/controller";
import { Request, Response } from "express";
import {
  formatInternalServerErrorMessage,
  formatReturnedMessage,
} from "../server/api/utils";
import httpCode from "../server/api/httpCode";

export class MMR implements Route {
  readonly name: string = "/cheat";

  async applyRoute(router: SubRouter): Promise<void> {
    router.getRouter.post(this.name, async (req: Request, res: Response) => {
      if (!req.query.amount) {
        return formatReturnedMessage(
          res,
          httpCode.BAD_REQUEST,
          "query arg 'amount' is missing"
        );
      }
      if (!req.query.userId) {
        return formatReturnedMessage(
          res,
          httpCode.BAD_REQUEST,
          "query arg 'userId' is missing"
        );
      }
      try {
        const user = await router.getDatabase.addMMR(
          +req.query.userId,
          +req.query.amount
        );
        if (user == null) {
          return formatReturnedMessage(
            res,
            httpCode.BAD_REQUEST,
            `user ${req.query.userId} not found`
          );
        } else {
          return formatReturnedMessage(res, httpCode.OK, {
            newMmr: user.mmr,
          });
        }
      } catch (e) {
        console.error("Error catch:", e);
        return formatInternalServerErrorMessage(res);
      }
    });
  }
}

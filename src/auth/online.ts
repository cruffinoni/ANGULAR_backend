import {Route, SubRouter} from "../server/api/controller";
import {Request, Response} from "express";
import {formatReturnedMessage} from "../server/api/utils";
import httpCode from "../server/api/httpCode";
import serverInstance from "../server/server";

export class Online implements Route {
  readonly name: string = "/online";

  async applyRoute(router: SubRouter): Promise<void> {
    router.getRouter.get(this.name, async (req: Request, res: Response) => {
      if (!req.query.id) {
        return formatReturnedMessage(
          res,
          httpCode.BAD_REQUEST,
          "query arg 'id' is missing"
        );
      }
      return formatReturnedMessage(res, httpCode.OK, {
        isConnected:
          serverInstance.socketIO.getUserSocket(String(req.query.id)) !==
          undefined,
      });
    });
  }
}

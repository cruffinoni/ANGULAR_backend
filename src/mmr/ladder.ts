import { Route, SubRouter } from "../server/api/controller";
import { Request, Response } from "express";
import { formatReturnedMessage } from "../server/api/utils";
import httpCode from "../server/api/httpCode";
import { User } from "@prisma/client";
import JWTClass from "../jwt/class";

export class Ladder implements Route {
  readonly name: string = "/ladder";

  async applyRoute(router: SubRouter): Promise<void> {
    router.getRouter.use(this.name, JWTClass.requireAuthorization);
    router.getRouter.get(this.name, async (req: Request, res: Response) => {
      try {
        const limit: number = req.query.limit && JSON.parse(<string>req.query.limit) ? JSON.parse(<string>req.query.limit) : 10;
        const ladder = await router.getDatabase.getTopLadder(limit);
        if (ladder == null) {
          return formatReturnedMessage(res, httpCode.OK, []);
        } else {
          return formatReturnedMessage(
            res,
            httpCode.OK,
            ladder.map((value: User) => {
              return {
                pseudo: value.pseudo,
                id: value.id,
                mmr: value.mmr,
              };
            })
          );
        }
      } catch (e) {
        console.error("Catch e:", e);
        return res.status(httpCode.INTERNAL_SERVER_ERROR).json({
          response: "internal server error",
        });
      }
    });
  }
}

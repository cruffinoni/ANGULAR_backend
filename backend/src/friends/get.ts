import { Route, SubRouter } from "../server/api/controller";
import { Request, Response } from "express";
import {
  formatInternalServerErrorMessage,
  formatOkMessage,
  formatReturnedMessage,
} from "../server/api/utils";
import httpCode from "../server/api/httpCode";
import { Friends, Friendship } from "@prisma/client";

export class GetFriends implements Route {
  readonly name: string = "/";

  async applyRoute(router: SubRouter): Promise<void> {
    router.getRouter.get(this.name, async (req: Request, res: Response) => {
      try {
        const friendships = await router.getDatabase.getFriends(
          res.locals.authorization.id
        );
        if (friendships == null) {
          return formatOkMessage(res);
        }
        const friends = friendships
          .filter((friend: Friends) => friend.status !== Friendship.DECLINED)
          .map((friend: Friends) => {
            return {
              friendId:
                friend.author == res.locals.authorization.id
                  ? friend.userId
                  : friend.author,
              status: friend.status,
            };
          });
        return formatReturnedMessage(res, httpCode.OK, friends);
      } catch (e) {
        console.error("[error - get friends]", e);
        return formatInternalServerErrorMessage(res);
      }
    });
  }
}

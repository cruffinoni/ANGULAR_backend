import { Route, SubRouter } from "../server/api/controller";
import { Request, Response } from "express";
import {
  formatInternalServerErrorMessage,
  formatOkMessage,
  formatReturnedMessage,
} from "../server/api/utils";
import httpCode from "../server/api/httpCode";
import serverInstance from "../server/server";
import { NotificationType } from "../socket/notification";
import { Friendship } from "@prisma/client";

export class AddFriend implements Route {
  readonly name: string = "/request";

  validationSchema = {
    type: "object",
    properties: {
      pseudo: { type: "string" },
    },
    required: ["pseudo"],
    additionalProperties: false,
  };

  async applyRoute(router: SubRouter): Promise<void> {
    router.getRouter.post(this.name, async (req: Request, res: Response) => {
      const validate = router.getAjvInstance.compile(this.validationSchema);
      if (!validate(req.body)) {
        return formatReturnedMessage(
          res,
          httpCode.BAD_REQUEST,
          "invalid body",
          router.getAjvInstance.errorsText(validate.errors)
        );
      }
      try {
        const target = await router.getDatabase.getUserByPseudo(
          req.body.pseudo
        );
        if (target == null) {
          return formatReturnedMessage(
            res,
            httpCode.NOT_FOUND,
            "user not found",
          );
        }
        if (target.id == res.locals.authorization.id) {
          return formatReturnedMessage(
            res,
            httpCode.BAD_REQUEST,
            "author can't add himself",
          );
        }
        const friendship = await router.getDatabase.getFriendshipAnyRelation(
          res.locals.authorization.id,
          target.id
        );
        if (friendship != null) {
          friendship.updatedAt.setHours(friendship.updatedAt.getHours() + 1);
          if (
            friendship.status == Friendship.DECLINED &&
            friendship.updatedAt.getTime() < Date.now()
          ) {
            await router.getDatabase.changeFriendshipStatus(
              friendship.id,
              Friendship.PENDING
            );
            return formatOkMessage(res);
          } else {
            return formatReturnedMessage(
              res,
              httpCode.FORBIDDEN,
              "friendship exists or has been declined too recently",
              {
                status: friendship.status,
                remainingTime:
                  friendship.status == Friendship.DECLINED
                    ? Math.floor(
                        (friendship.updatedAt.getTime() - Date.now()) / 1000
                      )
                    : undefined,
              }
            );
          }
        }
        await router.getDatabase.addFriend(
          res.locals.authorization.id,
          target.id
        );
        serverInstance.getNotificationSystem.sendNotification(
          NotificationType.FRIENDSHIP_NEW_REQUEST,
          target.id,
          {
            from: res.locals.authorization.id,
          }
        );
        return formatOkMessage(res);
      } catch (e) {
        console.error("[error - addfriend]", e);
        return formatInternalServerErrorMessage(res);
      }
    });
  }
}

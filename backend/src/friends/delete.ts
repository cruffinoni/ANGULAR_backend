import { Route, SubRouter } from "../server/api/controller";
import { Request, Response } from "express";
import {
  formatInternalServerErrorMessage,
  formatOkMessage,
  formatReturnedMessage,
} from "../server/api/utils";
import httpCode from "../server/api/httpCode";
import { Friendship } from "@prisma/client";
import serverInstance from "../server/server";
import { NotificationType } from "../socket/notification";

export class DeleteFriend implements Route {
  readonly name: string = "/";
  validationSchema = {
    type: "object",
    properties: {
      id: { type: "integer" },
    },
    required: ["id"],
    additionalProperties: false,
  };

  async applyRoute(router: SubRouter): Promise<void> {
    router.getRouter.delete(this.name, async (req: Request, res: Response) => {
      try {
        const validate = router.getAjvInstance.compile(this.validationSchema);
        if (!validate(req.body)) {
          return formatReturnedMessage(
            res,
            httpCode.BAD_REQUEST,
            "invalid body",
            router.getAjvInstance.errorsText(validate.errors)
          );
        }
        const friendship = await router.getDatabase.getFriendshipAnyRelation(
          res.locals.authorization.id,
          req.body.id
        );
        if (friendship == null) {
          return formatReturnedMessage(
            res,
            httpCode.NOT_FOUND,
            "there is no friendship between those 2"
          );
        }
        if (friendship.status === Friendship.PENDING) {
          return formatReturnedMessage(
            res,
            httpCode.CONFLICT,
            "friendship is pending, can't delete"
          );
        }
        await router.getDatabase.deleteFriendship(friendship.id);
        serverInstance.getNotificationSystem.sendNotification(
          NotificationType.FRIENDSHIP_REMOVED,
          req.body.id,
          {
            from: res.locals.authorization.id,
          }
        );
        return formatOkMessage(res);
      } catch (e) {
        console.error("[error - delete friendship]", e);
        return formatInternalServerErrorMessage(res);
      }
    });
  }
}

import { Route, SubRouter } from "../server/api/controller";
import { Request, Response } from "express";
import {
  formatInternalServerErrorMessage,
  formatOkMessage,
  formatReturnedMessage,
} from "../server/api/utils";
import httpCode from "../server/api/httpCode";
import { Friendship } from "@prisma/client";
import { NotificationType } from "../socket/notification";
import serverInstance from "../server/server";

export class ChangeStatus implements Route {
  readonly name: string = "/status";

  validationSchema = {
    type: "object",
    properties: {
      id: { type: "integer" },
      status: { enum: Object.values(Friendship) },
    },
    required: ["id", "status"],
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
      if (req.body.status == Friendship.PENDING) {
        return formatReturnedMessage(
          res,
          httpCode.BAD_REQUEST,
          "you can't set a friendship on status PENDING"
        );
      }
      try {
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
        if (friendship.status !== Friendship.PENDING) {
          return formatReturnedMessage(
            res,
            httpCode.CONFLICT,
            "friendship is not pending"
          );
        }
        if (friendship.author === res.locals.authorization.id) {
          return formatReturnedMessage(
            res,
            httpCode.FORBIDDEN,
            "author cannot accept friendship"
          );
        }
        await router.getDatabase.changeFriendshipStatus(
          friendship.id,
          req.body.status
        );
        serverInstance.getNotificationSystem.sendNotification(
          req.body.status == Friendship.ACCEPTED
            ? NotificationType.FRIENDSHIP_ACCEPTED
            : NotificationType.FRIENDSHIP_DECLINED,
          req.body.id,
          {
            from: res.locals.authorization.id,
          }
        );
        return formatOkMessage(res);
      } catch (e) {
        console.error("[error - updatefriendstatus]", e);
        return formatInternalServerErrorMessage(res);
      }
    });
  }
}

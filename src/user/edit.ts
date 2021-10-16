import { Route, SubRouter } from "../server/api/controller";
import { Request, Response } from "express";
import { formatOkMessage, formatReturnedMessage } from "../server/api/utils";
import httpCode from "../server/api/httpCode";
import { User } from "@prisma/client";
import { Database } from "../database/database";

export class Edit implements Route {
  readonly name: string = "/";

  validationSchema = {
    type: "object",
    properties: {
      id: { type: "integer" },
      pseudo: { type: "string" },
      password: { type: "string" },
      email: { type: "string" },
      avatar: { type: "string" },
    },
    required: ["id"],
    additionalProperties: false,
  };

  private static editUserAttribute<K extends keyof User>(
    data: User,
    key: K,
    value: User[K]
  ) {
    data[key] = value;
  }

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
        const user = await router.getDatabase.getUserById(+req.body.id);
        if (user == null) {
          return formatReturnedMessage(
            res,
            httpCode.FORBIDDEN,
            "invalid passed id"
          );
        }
        ["email", "pseudo", "password", "avatar"].forEach((key: string) => {
          if (req.body[key]) {
            if (key === "password") {
              req.body[key] = Database.encryptPassword(req.body[key]);
            }
            Edit.editUserAttribute(user, key as keyof User, req.body[key]);
          }
        });
        await router.getDatabase.updateUser(user);
        return formatOkMessage(res);
      } catch (e) {
        console.log(e);
        return formatReturnedMessage(
          res,
          httpCode.INTERNAL_SERVER_ERROR,
          "could not update user. make sure the username is unique"
        );
      }
    });
  }
}

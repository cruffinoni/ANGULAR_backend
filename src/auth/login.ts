import { Route, SubRouter } from "../server/api/controller";
import { Request, Response } from "express";
import { formatReturnedMessage } from "../server/api/utils";
import httpCode from "../server/api/httpCode";
import JWTClass from "../jwt/class";

export class Login implements Route {
  readonly name: string = "/login";

  validationSchema = {
    type: "object",
    properties: {
      pseudo: { type: "string" },
      password: { type: "string" },
    },
    required: ["pseudo", "password"],
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
        const user = await router.getDatabase.getUser(
          req.body.pseudo,
          req.body.password
        );
        if (!user) {
          return formatReturnedMessage(
            res,
            httpCode.FORBIDDEN,
            "incorrect pseudo or password"
          );
        } else {
          return formatReturnedMessage(res, httpCode.OK, {
            id: user.id,
            pseudo: req.body.pseudo,
            token: JWTClass.encode(user.id),
            mmr: user.mmr,
            avatar: user.avatar,
          });
        }
      } catch (e) {
        console.log(e);
        return formatReturnedMessage(
          res,
          httpCode.CONFLICT,
          "an account already exists"
        );
      }
    });
  }
}

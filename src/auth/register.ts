import { Route, SubRouter } from "../server/api/controller";
import { Request, Response } from "express";
import { formatReturnedMessage } from "../server/api/utils";
import httpCode from "../server/api/httpCode";
import JWTClass from "../jwt/class";

export class Register implements Route {
  readonly name: string = "/register";

  validationSchema = {
    type: "object",
    properties: {
      pseudo: { type: "string" },
      email: { type: "string" },
      password: { type: "string" },
    },
    required: ["pseudo", "email", "password"],
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
        const user = await router.getDatabase.createUser(
          req.body.email,
          req.body.password,
          req.body.pseudo
        );
        return formatReturnedMessage(res, httpCode.OK, {
          id: user.id,
          pseudo: req.body.pseudo,
          token: JWTClass.encode(user.id),
          mmr: user.mmr,
        });
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

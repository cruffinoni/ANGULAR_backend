import { Route, SubRouter } from "../server/api/controller";
import { Request, Response } from "express";

export class Root implements Route {
  readonly name: string = "/";

  async applyRoute(router: SubRouter): Promise<void> {
    router.getRouter.get("/", (req: Request, res: Response) => {
      res.status(200).json({
        response: "pong",
      });
    });
  }
}

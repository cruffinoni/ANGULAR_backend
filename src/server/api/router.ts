import { Request, Response, Router } from "express";
import { SubRouter } from "./controller";
import { PingRouter } from "../../ping/router";
import { Database } from "../../database/database";
import { AuthRouter } from "../../auth/router";
import { MMRRouter } from "../../mmr/router";
import { FriendRouter } from "../../friends/router";
import { UserRouter } from "../../user/router";

export class MainRouter {
  private db = new Database();
  private router: Router = Router();
  private subRouter: SubRouter[] = [
    new PingRouter(this.db),
    new AuthRouter(this.db),
    new MMRRouter(this.db),
    new FriendRouter(this.db),
    new UserRouter(this.db),
  ];

  get getRouter(): Router {
    return this.router;
  }

  public get getDatabase(): Database {
    return this.db;
  }

  async registerRouters(): Promise<void> {
    for (const subRouter of this.subRouter) {
      await subRouter.registerRoutes();
      console.log(`Registering sub router '${subRouter.getBasePath}'`);
      this.router.use(subRouter.getBasePath, subRouter.getRouter);
    }
    this.router.use((req: Request, res: Response) => {
      res.status(404).json({
        message: "route not found",
      });
    });
  }
}

import { SubRouter } from "../server/api/controller";
import { AddFriend } from "./add";
import { Database } from "../database/database";
import JWTClass from "../jwt/class";
import { ChangeStatus } from "./status";
import { GetFriends } from "./get";
import { DeleteFriend } from "./delete";

export class FriendRouter extends SubRouter {
  basePath = "/friend";
  routes = [
    new AddFriend(),
    new ChangeStatus(),
    new GetFriends(),
    new DeleteFriend(),
  ];

  constructor(db: Database) {
    super(db);
  }

  async registerRoutes(): Promise<void> {
    console.log(`Registering route for '${this.basePath}'`);
    this.router.use(JWTClass.requireAuthorization);
    for (const route of this.routes) {
      console.log(`Adding route '${this.basePath}${route.name}'`);
      await route.applyRoute(this);
    }
  }
}

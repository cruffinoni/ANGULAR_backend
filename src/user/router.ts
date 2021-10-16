import { SubRouter } from "../server/api/controller";
import { Database } from "../database/database";
import { Edit } from "./edit";

export class UserRouter extends SubRouter {
  basePath = "/user";
  routes = [new Edit()];

  constructor(db: Database) {
    super(db);
  }

  async registerRoutes(): Promise<void> {
    console.log(`Registering route for '${this.basePath}'`);
    for (const route of this.routes) {
      console.log(`Adding route '${this.basePath}${route.name}'`);
      await route.applyRoute(this);
    }
  }
}

import { SubRouter } from "../server/api/controller";
import { Root } from "./root";
import { Database } from "../database/database";

export class PingRouter extends SubRouter {
  basePath = "/ping";
  routes = [new Root()];

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

import { SubRouter } from "../server/api/controller";
import { Database } from "../database/database";
import { Ladder } from "./ladder";
import { MMR } from "./mmr";

export class MMRRouter extends SubRouter {
  basePath = "/mmr";
  routes = [new Ladder(), new MMR()];

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

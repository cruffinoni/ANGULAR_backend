import { SubRouter } from "../server/api/controller";
import { Database } from "../database/database";
import { Register } from "./register";
import { Login } from "./login";

export class AuthRouter extends SubRouter {
  basePath = "/auth";
  routes = [new Register(), new Login()];

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

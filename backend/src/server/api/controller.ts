import { Router } from "express";
import { Database } from "../../database/database";
import AJV, { Ajv } from "ajv";

export abstract class SubRouter {
  protected readonly db: Database;
  protected basePath = "/";
  protected routes: Route[] = [];
  protected router: Router = Router();
  protected ajvInstance: Ajv = new AJV();

  protected constructor(db: Database) {
    this.db = db;
  }

  get getBasePath(): string {
    return this.basePath;
  }

  get getRouter(): Router {
    return this.router;
  }

  get getAjvInstance(): Ajv {
    return this.ajvInstance;
  }

  get getDatabase(): Database {
    return this.db;
  }

  abstract registerRoutes(): Promise<void>;
}

export interface Route {
  readonly name: string;
  applyRoute: (subRouter: SubRouter) => Promise<void>;
}

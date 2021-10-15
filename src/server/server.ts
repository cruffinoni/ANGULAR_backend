import express from "express";
import {MainRouter} from "./api/router";
import cors from "cors";
import JWTClass from "../jwt/class";
import * as http from "http";
import {SocketWrapper} from "../socket/socketWrapper";
import {Notification} from "../socket/notification";

export class Server {
  public app = express();
  public httpServer = new http.Server(this.app);
  public socketIO = new SocketWrapper(this.httpServer);
  public router = new MainRouter();
  private notificationSystem = new Notification(this.socketIO);
  private port: string = process.env.APP_PORT || "8080";

  constructor() {
    this.app.use(cors({credentials: true, origin: true}));
    this.app.use(express.json());
    this.app.use("/", this.router.getRouter);
    JWTClass.storeSecret();
  }

  get getNotificationSystem(): Notification {
    return this.notificationSystem;
  }

  async run(): Promise<void> {
    await this.router.registerRouters();
    this.httpServer.listen(this.port, () => {
      console.log(`> Listening on port ${this.port}`);
    });
  }
}

const serverInstance = new Server();

export default serverInstance;

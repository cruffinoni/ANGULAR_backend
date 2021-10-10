import dotenv from "dotenv";
import serverInstance from "./server/server";

dotenv.config({
  path: ".env",
});
serverInstance.run();

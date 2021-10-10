import { decode, sign, verify } from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";
import { formatReturnedMessage } from "../server/api/utils";
import httpCode from "../server/api/httpCode";

export interface JWTData {
  id: number;
}

class JWTError extends Error {
  public name = "";
  public message = "";
  public expiredAt = "";
}

class JWTWrapper {
  private secret = "";

  public storeSecret(): void {
    if (this.secret !== "") {
      console.warn("[jwt] secret is already stored");
      return;
    }
    if (process.env.JWT_SECRET == undefined) {
      console.error("JWT_SECRET is not defined and is required");
      process.exit(1);
    }
    this.secret = process.env.JWT_SECRET;
  }

  encode(userId: number): string {
    const data: JWTData = {
      id: userId,
    };
    return sign(data, this.secret, { expiresIn: "4h" });
  }

  decode(token: string): JWTData {
    return decode(token) as JWTData;
  }

  // Exemple:     this.router.use(JWTClass.requireAuthorization);
  requireAuthorization(
    request: Request<unknown>,
    response: Response<unknown, Record<string | number | symbol, unknown>>,
    next: NextFunction
  ) {
    if (request.headers.authorization == undefined) {
      return formatReturnedMessage(
        response,
        httpCode.FORBIDDEN,
        "missing authorization"
      );
    }
    response.locals.authorization = JWTClass.decode(
      request.headers.authorization
    );
    next();
  }

  isValidToken(token: string): boolean {
    try {
      verify(token, this.secret);
      return true;
    } catch (error) {
      if (error instanceof JWTError) {
        if (error.name === "TokenExpiredError") {
          return false;
        }
      }
      console.error(error);
      return false;
    }
  }
}

const JWTClass = new JWTWrapper();
export default JWTClass;

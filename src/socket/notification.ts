import { SocketWrapper } from "./socketWrapper";
import { AnyType } from "../server/api/utils";

export enum NotificationType {
  FRIENDSHIP_NEW_REQUEST,
  FRIENDSHIP_ACCEPTED,
  FRIENDSHIP_DECLINED,
  FRIENDSHIP_REMOVED,
}

interface notificationData {
  type: string;
  data: AnyType;
}

export class Notification {
  socketWrapper: SocketWrapper;
  readonly eventName = "notification";

  constructor(socketWrapper: SocketWrapper) {
    this.socketWrapper = socketWrapper;
  }

  public sendNotification(
    notification: NotificationType,
    userId: number,
    data: AnyType
  ): void {
    const socket = this.socketWrapper.getUserSocket(String(userId));
    if (!socket) {
      console.error(
        `[notification - ${NotificationType[notification]}] ${userId} not found`
      );
      return;
    }
    socket.emit(this.eventName, {
      type: NotificationType[notification],
      data: data,
    } as notificationData);
  }
}

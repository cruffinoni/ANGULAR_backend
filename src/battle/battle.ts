import { v4 as uuidv4 } from "uuid";
import { SocketWrapper } from "../socket/socketWrapper";
import { BattleState } from "../enum/battleState";
import { Socket } from "socket.io";
import { BattlePackage } from "../enum/eventType";

type userData = {
  id: string;
  socket: Socket | undefined;
  index: number;
};

type ChatMessage = {
  author: string;
  message: string;
};

const isChatMessage = (x: ChatMessage | BattlePackage): x is ChatMessage =>
  (x as ChatMessage).message !== undefined;

export class Battle {
  currentState: BattleState = BattleState.STARTING;
  users: userData[] = [];
  serverSocket: SocketWrapper;
  matchUUID: string = uuidv4();

  constructor(userA_ID: string, userB_ID: string, socketIO: SocketWrapper) {
    this.users.push(
      {
        index: 0,
        socket: undefined,
        id: userA_ID,
      },
      {
        index: 1,
        socket: undefined,
        id: userB_ID,
      }
    );
    this.users[0].id = userA_ID;
    this.users[1].id = userB_ID;
    this.serverSocket = socketIO;
    this.currentState = BattleState.WAITING_FOR_PLAYER_CONNECTION;
    this.waitForPlayerConnection(10);
  }

  private waitForPlayerConnection(waitDurationInSecond: number) {
    let counter = waitDurationInSecond * 1000;
    const interval = setInterval(() => {
      // DEFAULT END CONDITION
      if (this.users[0].socket && this.users[1].socket) {
        console.log(
          `MATCH (id: ${this.matchUUID}): the 2 clients socket are successfully connected`
        );
        this.currentState = BattleState.STARTING;
        clearInterval(interval);
        return this.startBattle();
      }
      if (counter < 0) {
        console.error(
          `MATCH (id: ${this.matchUUID}): failed to start because at least one socket isn't connect`
        );
        this.currentState = BattleState.ENDED;
        clearInterval(interval);
        return;
      }
      this.users.forEach((user: userData) => {
        if (!user.socket) {
          user.socket = this.serverSocket.getUserSocket(user.id);
          if (user.socket) {
            user.socket.emit("matchUUID", this.matchUUID);
            console.log("send user index");
            user.socket.emit(`match-${this.matchUUID}userIdx`, user.index);
          }
        }
      });

      this.sendMessageToRoom("waitingTimeRemaining", counter);
      console.log(
        `MATCH (id: ${this.matchUUID}): connection time reamaining ${
          counter / 1000
        } secs.`
      );
      counter -= 1000;
    }, 1000);
  }

  private async startBattle() {
    this.instantiateEvent();

    let counter = 3;
    const interval = setInterval(() => {
      if (counter < 0) {
        clearInterval(interval);
        this.currentState = BattleState.PLAYING;
        return;
      }
      this.sendMessageToRoom("Game start in", counter);
      console.log("BATTLE START IN", counter);
      counter--;
    }, 1000);
  }

  private sendMessageToRoom(eventType: string, data: number | ChatMessage) {
    this.serverSocket.getServerSocket
      .to("MATCH" + this.matchUUID)
      .emit(eventType, data);
  }

  // -------------------------------------- EVENT HANDLER -----------------------------------

  public instantiateEvent(): void {
    console.log("package from 1", this.users[0].socket?.id);
    console.log("package from 2", this.users[1].socket?.id);
    const eventId = `match-${this.matchUUID}`;
    this.users[0].socket?.join("MATCH" + this.matchUUID);
    this.users[1].socket?.join("MATCH" + this.matchUUID);

    this.users[0].socket?.on(eventId, (event: BattlePackage | ChatMessage) => {
      if (isChatMessage(event)) {
        this.sendMessageToRoom(eventId, event as ChatMessage);
      } else {
        this.users[1].socket?.emit(eventId, event as BattlePackage);
      }
    });
    this.users[1].socket?.on(eventId, (event: BattlePackage | ChatMessage) => {
      if (isChatMessage(event)) {
        this.sendMessageToRoom(eventId, event as ChatMessage);
      } else {
        this.users[0].socket?.emit(eventId, event as BattlePackage);
      }
    });
  }
}

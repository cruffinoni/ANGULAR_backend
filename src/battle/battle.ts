import { v4 as uuidv4 } from "uuid";
import { SocketWrapper } from "../socket/socketWrapper";
import { BattleState } from "../enum/battleState";
import { Socket } from "socket.io";
import { BattlePackage, GameDisconnection, GameEnd } from "../enum/eventType";
import { CalculateMMRGain } from "../mmr/utils";
import serverInstance from "../server/server";

type userData = {
  id: string;
  socket: Socket | undefined;
  index: number;
};

type ChatMessage = {
  author: string;
  message: string;
};

type BattleEvent = ChatMessage | BattlePackage | GameEnd | GameDisconnection;

const isChatMessage = (event: BattleEvent): event is ChatMessage =>
  (event as ChatMessage).message !== undefined;

const isEndgameQuery = (event: BattleEvent): event is GameEnd =>
  (event as GameEnd).winner !== undefined;

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
    console.log("SEND MESSAGE TO ROOM", data);
    this.serverSocket.getServerSocket
      .to("MATCH" + this.matchUUID)
      .emit(eventType, data);
  }

  private async addMmrToWinner(winnerIdx: number): Promise<void> {
    const user1 = await serverInstance.router.getDatabase.getUserById(
      +this.users[0].id
    );
    const user2 = await serverInstance.router.getDatabase.getUserById(
      +this.users[1].id
    );
    if (user1 == null || user2 == null) {
      console.error(
        `[end-game] one of the user id is invalid: "${this.users[0].id}" or "${this.users[1].id}"`
      );
      return;
    }
    const gain = CalculateMMRGain(user1, user2);
    await serverInstance.router.getDatabase.addMMR(
      +this.users[winnerIdx].id,
      +gain
    );
    await serverInstance.router.getDatabase.addMMR(
      +this.users[winnerIdx === 1 ? 0 : 1].id,
      -gain
    );
  }

  private handleUserDisconnection(): void {
    if (this.currentState === BattleState.PLAYING) {
      this.currentState = BattleState.ENDED;
      this.sendMessageToRoom("DISCONNECTION", 0);
      this.serverSocket.matchEnd(this);
    }
  }

  private async handleIncomingEvents(index: number, event: BattleEvent) {
    const eventId = `match-${this.matchUUID}`;
    if (isChatMessage(event)) {
      this.sendMessageToRoom(eventId, event as ChatMessage);
    } else if (isEndgameQuery(event)) {
      this.currentState = BattleState.ENDED;
      await this.addMmrToWinner(event.winner);
      this.serverSocket.matchEnd(this);
    } else {
      this.users[index].socket?.emit(eventId, event as BattlePackage);
    }
  }

  private checkUserSocketValidity(): boolean {
    return (
      this.users[0].socket?.connected === true &&
      this.users[1].socket?.connected === true
    );
  }

  // -------------------------------------- EVENT HANDLER -----------------------------------

  public instantiateEvent(): void {
    const eventId = `match-${this.matchUUID}`;
    
    // reset old listener
    this.users[0].socket?.removeAllListeners(eventId);
    this.users[0].socket?.removeAllListeners("MATCH_DISCONNECTION");

    this.users[1].socket?.removeAllListeners(eventId);
    this.users[1].socket?.removeAllListeners("MATCH_DISCONNECTION");






    this.users.forEach((user: userData) => {
      if (user.socket) {
        user.socket.join("MATCH" + this.matchUUID);
        user.socket.on("MATCH_DISCONNECTION", () => {
          this.handleUserDisconnection();
        });
      }
    });
    this.users[0].socket?.on(eventId, async (event: BattleEvent) => {
      if (!this.checkUserSocketValidity()) {
        this.handleUserDisconnection();
        return;
      }
      await this.handleIncomingEvents(1, event);
    });
    this.users[1].socket?.on(eventId, async (event: BattleEvent) => {
      if (!this.checkUserSocketValidity()) {
        this.handleUserDisconnection();
        return;
      }
      await this.handleIncomingEvents(0, event);
    });
  }
}

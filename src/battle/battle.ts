import { BattlePackage } from "../enum/eventType";
import { v4 as uuidv4 } from "uuid";
import { SocketWrapper } from "../socket/socketWrapper";
import { BattleState } from "../enum/battleState";

export class Battle {
  currentState: BattleState = BattleState.STARTING;

  userA_ID = "";
  userA_idx = 0;
  socketA: any = null;

  userB_ID = "";
  socketB: any = null;
  userB_idx = 1;

  serverSocket: SocketWrapper;

  matchUUID: string = uuidv4();

  constructor(userA_ID: string, userB_ID: string, socketIO: SocketWrapper) {
    this.userA_ID = userA_ID;
    this.userB_ID = userB_ID;

    this.serverSocket = socketIO;

    this.currentState = BattleState.WAITING_FOR_PLAYER_CONNECTION;
    this.waitForPlayerConnection(this.userA_ID, this.userB_ID, 10);
  }

  private waitForPlayerConnection(
    userA_ID: string,
    userB_ID: string,
    waitDurationInSecond: number
  ) {
    let counter = waitDurationInSecond * 1000;
    const interval = setInterval(() => {
      // DEFAULT END CONDITION
      if (this.socketA && this.socketB) {
        console.log(
          "MATCH:",
          this.matchUUID,
          "the 2 clients socket are succesfully connected"
        );
        this.currentState = BattleState.STARTING;
        clearInterval(interval);
        return this.startBattle();
      }
      if (counter < 0) {
        console.error(
          "MATCH:",
          this.matchUUID,
          "failed to start because at least one socket isn't connect"
        );

        this.currentState = BattleState.ENDED;
        clearInterval(interval);
        return;
      }
      if (!this.socketA) {
        console.log("A:", userA_ID);
        this.socketA = this.serverSocket.getUserSocket(userA_ID);
        if (this.socketA) {
          this.socketA.join("MATCH" + this.matchUUID);
          this.socketA.emit("matchUUID", this.matchUUID);
          this.socketA.emit(
            "match-" + this.matchUUID + "userIdx",
            this.userA_idx
          );
        }
      }
      if (!this.socketB) {
        console.log("B:", userB_ID);
        this.socketB = this.serverSocket.getUserSocket(userB_ID);
        if (this.socketB) {
          this.socketB.join("MATCH" + this.matchUUID);
          this.socketB.emit("matchUUID", this.matchUUID);
          this.socketB.emit(
            "match-" + this.matchUUID + "userIdx",
            this.userB_idx
          );
        }
      }

      this.sendMessageToRoom("waitingTimeRemaining", counter);
      console.log(
        "MATCH:",
        this.matchUUID,
        "connection time remaining:",
        counter / 1000,
        "seconds"
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

  public getBattleStatus(): BattleState {
    return this.currentState;
  }

  private sendMessageToRoom(eventType: string, data: any) {
    this.serverSocket.getServerSocket
      .to("MATCH" + this.matchUUID)
      .emit(eventType, data);
  }

  // -------------------------------------- EVENT HANDLER -----------------------------------

  private instantiateEvent() {
    this.socketA.on("match-" + this.matchUUID, (evt: BattlePackage) => {
      this.socketB.emit("match-" + this.matchUUID, evt);
    });
    this.socketB.on("match-" + this.matchUUID, (evt: BattlePackage) => {
      this.socketA.emit("match-" + this.matchUUID, evt);
    });
  }

  private MoveRight(evt: any) {
    console.log("MoveRight", evt);
  }

  private MoveLeft(evt: any) {
    console.log("MoveLeft", evt);
  }

  private Jump(evt: any) {
    console.log("Jump", evt);
  }

  private Crouch(evt: any) {
    console.log("Crouch", evt);
  }

  private AttackFeet(evt: any) {
    console.log("AttackFeet", evt);
  }

  private AttackHand(evt: any) {
    console.log("AttackHand", evt);
  }

  private AttackThrow(evt: any) {
    console.log("AttackThrow", evt);
  }
}

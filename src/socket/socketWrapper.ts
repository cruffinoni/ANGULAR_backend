import { Server, Socket } from "socket.io";
import { Battle } from "../battle/battle";
import * as http from "http";
import { FifoMatchmaker } from "../matchmaking/matchmaking";
import { User } from ".prisma/client";

/**
 * Class that is going to handle the socket of every user
 */
export class SocketWrapper {
  private battles: Battle[] = [];
  private readonly serverSocket: Server;
  private matchmaking = new FifoMatchmaker(SocketWrapper.startMatch, this);

  clientMap: Map<string, Socket> = new Map<string, Socket>();

  constructor(httpNetwork: http.Server | number) {
    this.serverSocket = new Server(httpNetwork, {
      cors: {
        origin: "http://localhost:4200",
        methods: ["*"],
        allowedHeaders: ["my-custom-header"],
        credentials: true,
      },
    });
    this.startSocketIO();
  }

  // ------------------------------------------------- GETTER --------------------------------------------

  /**
   * return the socket of a specific user
   * @param userID the userID of the socket
   * @returns the socket
   */
  public getUserSocket(userID: string): Socket | undefined {
    return this.clientMap.get(userID);
  }

  /**
   * return the server socket
   * @returns the server socket
   */
  public get getServerSocket(): Server {
    return this.serverSocket;
  }

  // ------------------------------------------ SETUP EVENT FUNCTION -------------------------------------
  /**
   * init the 2 main listener
   * connection -> that is triggered when a client is connection to the server
   * disconnect -> that is triggered when a client loose connection to the server
   */
  public startSocketIO(): void {
    console.log("Start socketIO");
    this.serverSocket.on("connection", (socket: Socket) => {
      this.newConnection(socket);
    });
    this.serverSocket.on("disconnect", (reason: unknown) => {
      // reason documentation: https://socket.io/docs/v3/client-socket-instance/#disconnect
      console.error("Server socket disconnected:", reason);
    });
  }

  // -------------------------------------------- EVENT FUNCTION -----------------------------------------

  /**
   * function that will be call on a new user connection
   * @param socket the socket of the new user
   */
  private newConnection(socket: Socket): void {
    // get in the query param the id of the user that is connecting
    const userID = socket.handshake.query.userID as string;
    this.clientMap.set(userID, socket);

    this.battles.forEach((battle: Battle) => {
      if (battle.users[0].id === userID) {
        battle.users[0].socket = socket;
        battle.instantiateEvent();
      }
      if (battle.users[1].id === userID) {
        battle.users[1].socket = socket;
        battle.instantiateEvent();
      }
    });

    this.instanciateBattleEvent(socket);

    socket.on("disconnect", (reason: string) => {
      this.onUserSocketDisconnect(reason, userID);
    });

    console.log("new connection arrived id:", userID);
  }

  private static startMatch(users: User[], instance: SocketWrapper): void {
    if (users.length === 2) {
      console.log("start matchmaking battle match with:", users[0].id, "against", users[1].id);
      const tmp = new Battle(
        users[0].id.toString(),
        users[1].id.toString(),
        instance
      );
      instance.battles.push(tmp);
    }
  }

  private instanciateBattleEvent(socket: Socket) {
    socket.on("joinMatchMaking", (data) => {
      console.log("joinMatchMaking:", data);
      this.matchmaking.joinQueue(Number(data));
    });

    socket.on("leaveMatchMaking", (data) => {
      this.matchmaking.leaveQueue(Number(data));
    });

    socket.on("friendBattle", (data) => {
      console.log("data", data);
      if (data.users.length === 2) {
        console.log("start friend match with:", data.users[0], "against", data.users[1]);
        const tmp = new Battle(
          data.users[0],
          data.users[1],
          this
        );
        this.battles.push(tmp);
      }
    });
  }

  public matchEnd(battleInstance: Battle): void {
    const idx = this.battles.indexOf(battleInstance);
    if (idx !== -1) {
      this.battles.splice(idx, 1);
    }
  }

  private onUserSocketDisconnect(reason: string, id: string) {
    console.log(`Socket id ${id} disconnected: ${reason}`);
    this.clientMap.delete(id);
  }
}

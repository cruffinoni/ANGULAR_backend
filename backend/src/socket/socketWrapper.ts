import { Server, Socket } from "socket.io";
import { Battle } from "../battle/battle";
import * as http from "http";

/**
 * Class that is going to handle the socket of every user
 */
export class SocketWrapper {
  private readonly serverSocket: Server;
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
   * connection -> that is triggerd when a client is connection to the server
   * disconnect -> that is triggerd when a client loose connection to the server
   */
  public startSocketIO(): void {
    console.log("Start socketIO");
    this.serverSocket.on("connection", (socket: Socket) => {
      this.newConnection(socket);
    });
    this.serverSocket.on("disconnect", (reason: any) => {
      // reason documentation: https://socket.io/docs/v3/client-socket-instance/#disconnect
      this.onDisconnect(reason);
    });
  }

  // -------------------------------------------- EVENT FUNCTION -----------------------------------------

  /**
   * function that will be call on a new user connection
   * @param socket the socket of the new user
   */
  private newConnection(socket: Socket): void {
    // get in the querry param the id of the user that is connecting
    const userID = socket.handshake.query.userID as string;
    this.clientMap.set(userID, socket);

    socket.on("startMatch", (data) => {
      console.log("start match with:", data);
      new Battle(data.data.userA, data.data.userB, this);
    });

    console.log("new connection arrived id:", userID);
  }

  private onDisconnect(reason: any) {
    console.log("DISCONNECTION:", reason);
  }
}

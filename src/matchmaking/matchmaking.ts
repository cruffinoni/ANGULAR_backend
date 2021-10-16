import { User } from ".prisma/client";
import { Database } from '../database/database';
import { SocketWrapper } from '../socket/socketWrapper';

export class FifoMatchmaker {

    private serverSocket: SocketWrapper
    private db = new Database()
    private matchSize = 2 // number of player in a match
    private resolver: (players: User[], serverSocket: SocketWrapper) => void;
    private playerQueue: User[] = []
    private checkInterval = 2000; // Time to check for players, value in milliseconds

	constructor(resolver: (players: User[], serverSocket: SocketWrapper) => void, serverSocket: SocketWrapper) {
        this.resolver = resolver;
        this.serverSocket = serverSocket;
		setInterval(this.FifoMatch, this.checkInterval);
	}

    public async joinQueue(userID: number): Promise<void> {
        const user = await this.db.getUserById(userID);
        if (user && !this.playerQueue.includes(user)) {
            this.playerQueue.push(user);
        }
    }
    public leaveQueue(userID: number): void {
        this.playerQueue.forEach((elem, idx) => {
            if (elem.id === userID) {
                this.playerQueue.splice(idx, 1);
                return;
            }
        });
    }

	private FifoMatch = (): void => {
		let players: User[];
        this.playerQueue.sort((a:User, b:User): number => { if (a.mmr > b.mmr) { return 1; } else { return -1; } });
		while (this.playerQueue.length >= this.matchSize) {
			players = [];
			while (this.playerQueue.length > 0 && players.length < this.matchSize) {
				players.push(this.playerQueue.pop() as User);
			}
			this.resolver(players, this.serverSocket);
		}
	}
}
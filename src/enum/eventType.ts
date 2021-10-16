export type BattlePackage = {
  userID?: string;
  userIdx?: number;
  position: {
    x: number;
    y: number;
  };
  state: string;
};

export type GameEnd = {
  gameEnded: true;
  winner: number;
};

export type GameDisconnection = {
  userID: string;
}
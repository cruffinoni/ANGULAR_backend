import {User} from "@prisma/client";

const linearFunction = (x: number, y: number) => Math.sqrt(Math.abs(x - y));

const miniGain = 100;

export const CalculateMMRGain = (player1: User, player2: User): number => {
  const gain = linearFunction(player1.mmr, player2.mmr);
  return Math.round(gain < miniGain ? miniGain : gain);
};

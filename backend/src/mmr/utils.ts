import { User } from "@prisma/client";

const linearFunction = (x: number, y: number) => Math.abs(x - y) * 0.75;

const miniGain = 100;

export const calculateMMRGain = (player1: User, player2: User): number => {
  const gain = linearFunction(player1.MMR, player2.MMR);
  return gain < miniGain ? miniGain : gain;
};

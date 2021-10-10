import { Friends, Friendship, PrismaClient, User } from "@prisma/client";
import sha256 = require("crypto-js/sha256");

export class Database {
  private prismaClient: PrismaClient = new PrismaClient();

  async createUser(
    email: string,
    password: string,
    pseudo: string
  ): Promise<User> {
    return await this.prismaClient.user.create({
      data: {
        email: email,
        pseudo: pseudo,
        password: sha256(password).toString(),
      },
    });
  }

  async getUser(pseudo: string, password: string): Promise<User | null> {
    return await this.prismaClient.user.findFirst({
      where: {
        pseudo: pseudo,
        password: sha256(password).toString(),
      },
    });
  }

  async getUserById(userId: number): Promise<User | null> {
    return await this.prismaClient.user.findFirst({
      where: {
        id: userId,
      },
    });
  }

  async getUserByPseudo(pseudo: string): Promise<User | null> {
    return await this.prismaClient.user.findFirst({
      where: {
        pseudo: pseudo,
      },
    });
  }

  async getTopLadder(limit = 10): Promise<User[] | null> {
    return await this.prismaClient.user.findMany({
      orderBy: {
        mmr: "desc",
      },
      take: limit,
    });
  }

  async addMMR(userId: number, mmr: number): Promise<User | null> {
    const user = await this.getUserById(userId);
    if (user == null) {
      return null;
    }
    return this.setMMR(userId, mmr + user.mmr);
  }

  async setMMR(userId: number, mmr: number): Promise<User> {
    return await this.prismaClient.user.update({
      data: {
        mmr: mmr,
      },
      where: {
        id: userId,
      },
    });
  }

  /* Friends */
  async addFriend(userId: number, targetId: number): Promise<void> {
    await this.prismaClient.user.update({
      where: {
        id: targetId,
      },
      data: {
        Friends: {
          create: {
            author: userId,
          },
        },
      },
    });
  }
  async getFriendshipAnyRelation(
    user1: number,
    user2: number
  ): Promise<Friends | null> {
    return await this.prismaClient.friends.findFirst({
      where: {
        OR: [
          {
            author: user1,
            userId: user2,
          },
          {
            author: user2,
            userId: user1,
          },
        ],
      },
    });
  }

  async changeFriendshipStatus(
    friendshipId: number,
    status: Friendship
  ): Promise<void> {
    await this.prismaClient.friends.update({
      data: {
        status: status,
      },
      where: {
        id: friendshipId,
      },
    });
  }

  async deleteFriendship(friendshipId: number): Promise<void> {
    await this.prismaClient.friends.delete({
      where: {
        id: friendshipId,
      },
    });
  }

  async getFriends(userId: number): Promise<Friends[] | null> {
    return this.prismaClient.friends.findMany({
      where: {
        OR: [
          {
            author: userId,
          },
          {
            userId: userId,
          },
        ],
      },
    });
  }
}

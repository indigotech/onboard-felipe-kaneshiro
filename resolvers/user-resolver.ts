import { UserInput, User } from '../types/types';
import { PrismaClient } from '@prisma/client';

const usersList: User[] = [];

export const resolvers = {
  Query: {
    showUsersList: (): User[] => {
      if (usersList.length === 0) {
        console.log('No users found.');
      }

      return usersList;
    },
  },

  Mutation: {
    createUser: async (_: unknown, args: { userData: UserInput }, context: { prisma: PrismaClient }): Promise<User> => {
      const existingUser = await context.prisma.user.findUnique({
        where: { email: args.userData.email },
      });
      if (existingUser) {
        throw new Error(`E-mail ${args.userData.email} is already in use.`);
      }

      const newUser = await context.prisma.user.create({
        data: {
          name: args.userData.name,
          email: args.userData.email,
          password: args.userData.password,
          birthDate: new Date(args.userData.birthDate),
        },
      });

      usersList.push(newUser);

      return newUser;
    },
  },
};

import { UserInput, User } from '../types/types';
import prisma from '../prisma';

export const resolvers = {
  Query: {
    users: (): User[] => {
      return [];
    },
  },

  Mutation: {
    createUser: async (_: unknown, args: { userData: UserInput }): Promise<User> => {
      const existingUser = await prisma.user.findUnique({
        where: { email: args.userData.email },
      });

      if (existingUser) {
        throw new Error(`E-mail ${args.userData.email} is already in use.`);
      }

      const newUser = await prisma.user.create({
        data: {
          ...args.userData,
          birthDate: new Date(args.userData.birthDate),
        },
      });

      return newUser;
    },
  },
};

import { UserInput, User } from '../types/types';
import { validateUserInput } from '../validation';
import prisma from '../prisma';

const checkEmailExistence = async (email: string): Promise<void> => {
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });
  if (existingUser) {
    throw new Error(`E-mail ${email} is already in use.`);
  }
};

const createNewUser = async (userData: UserInput): Promise<User> => {
  return prisma.user.create({
    data: {
      ...userData,
      birthDate: new Date(userData.birthDate),
    },
  });
};

export const resolvers = {
  Query: {
    users: async (): Promise<User[]> => {
      return await prisma.user.findMany();
    },
  },

  Mutation: {
    createUser: async (_: unknown, args: { userData: UserInput }): Promise<User> => {
      const { userData } = args;

      try {
        await checkEmailExistence(userData.email);

        validateUserInput(userData);

        const newUser = await createNewUser(userData);

        return newUser;
      } catch (error) {
        console.error('Failed to create user:', (error as Error).message);
        throw new Error((error as Error).message);
      }
    },
  },
};

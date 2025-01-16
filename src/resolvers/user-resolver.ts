import { UserInput, User } from '../types/types';
import { validateUserInput } from '../validation';
import prisma from '../prisma';
import { CustomError } from '../errors/format-error';
import bcrypt from 'bcrypt';

const checkEmailExistence = async (email: string): Promise<void> => {
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });
  if (existingUser) {
    throw new CustomError(
      "Email inserido já está em uso.",
      400,
      "Ecscolha um email diferente."
      );
  }
};

const createNewUser = async (userData: UserInput): Promise<User> => {
  const hashedPassword = await bcrypt.hash(userData.password, 10);

  return prisma.user.create({
    data: {
      ...userData,
      password: hashedPassword,
      birthDate: new Date(userData.birthDate),
    },
  });
};

export const resolvers = {
  Query: {
    users: async (): Promise<User[]> => {
      return await prisma.user.findMany();
    },
    hello: async (): Promise<string> => {
      return 'Hello, World!';
    },
  },

  Mutation: {
    createUser: async (_: unknown, args: { userData: UserInput }): Promise<User> => {
      const { userData } = args;

        await checkEmailExistence(userData.email);

        validateUserInput(userData);

        const newUser = await createNewUser(userData);

        return newUser;
    },
  },
};

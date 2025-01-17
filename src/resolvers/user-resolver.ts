import { UserInput, User, LoginInput } from '../types/types';
import { validateUserInput } from '../validation';
import { CustomError } from '../errors/format-error';
import prisma from '../prisma';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const checkEmailExistence = async (email: string): Promise<void> => {
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });
  if (existingUser) {
    throw new CustomError('Email inserido já está em uso.', 409, 'Escolha um email diferente.');
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

      validateUserInput(userData);

      await checkEmailExistence(userData.email);

      const newUser = await createNewUser(userData);

      return newUser;
    },

    login: async (_: unknown, args: { loginData: LoginInput }): Promise<{ user: User; token: string }> => {
      const { loginData } = args;

      const user = await prisma.user.findUnique({
        where: { email: loginData.email },
      });

      if (!user) {
        throw new CustomError('Usuário não encontrado', 404, 'Verifique o email e tente novamente.');
      }

      const isPasswordCorrect = await bcrypt.compare(loginData.password, user.password);

      if (!isPasswordCorrect) {
        throw new CustomError('Senha incorreta', 401, 'Verifique a senha e tente novamente.');
      }

      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET as string ,{ expiresIn: '1h' });

      return { user, token };
    },
  },
};

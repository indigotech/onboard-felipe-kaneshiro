import { UserInput, User, LoginInput } from '../types/types';
import { validateUserInput } from '../validation';
import { CustomError } from '../errors/format-error';
import { validateAuth } from '../utils/auth-utils';
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
    user: async (_: unknown, args: { id: string }, context: { user: string | null }): Promise<User> => {
      const { id } = args;

      validateAuth(context.user);

      const user = await prisma.user.findUnique({
        where: { id: Number(id) },
      });

      if (!user) {
        throw new CustomError('Usuário não encontrado.', 404, 'Tente novamente com um ID válido.');
      }

      return user;
    },

    Users: async (_: unknown, args: { amount: number | null }, context: { user: string | null }): Promise<User[]> => {
      const { amount } = args;

      if (!context.user) {
        throw new CustomError('Usuário não autenticado ou tempo de login expirado.', 401, 'Faça login para continuar.');
      }

      if (typeof(amount) !== 'number' || amount === null || amount === undefined){
        throw new CustomError('Entrada inválida', 400, 'A quantidade de usuários deve ser um número.');
      }

      if (amount <= 0) {
        throw new CustomError('Quantidade inválida', 400, 'A quantidade de usuários deve ser maior que zero.');
      }

      const DEFAULT_AMOUNT = 15;
      const users = await prisma.user.findMany({
        take: amount ? amount : DEFAULT_AMOUNT,
        orderBy: { name: 'asc' },
      });
      
      return users;
    },
  },

  Mutation: {
    createUser: async (_: unknown, args: { userData: UserInput }, context: { user: string | null }): Promise<User> => {
      const { userData } = args;

      validateAuth(context.user);

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

      const expiresIn = loginData.rememberMe ? '7d' : '1h';

      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET as string, { expiresIn });

      return { user, token };
    }
  },
};

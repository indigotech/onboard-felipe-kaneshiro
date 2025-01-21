import { UserInput, User, LoginInput, PaginationInput, UserPagination } from '../types/types';
import { validateUserInput } from '../validation';
import { CustomError } from '../errors/format-error';
import { validateAuth } from '../utils/auth-utils';
import prisma from '../prisma';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { validateAuth } from '../utils/auth-utils';

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

  return await prisma.user.create({
    data: {
      ...userData,
      password: hashedPassword,
      birthDate: new Date(userData.birthDate),
      addresses: { create: userData.addresses },
    },
    include: { addresses: true },
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

    Users: async (
      _: unknown,
      args: { pageData: PaginationInput },
      context: { user: string | null },
    ): Promise<UserPagination> => {
      const { pageData } = args;

      validateAuth(context.user);

      if (pageData.limit <= 0) {
        throw new CustomError('Quantidade inválida.', 400, 'A quantidade de usuários deve ser maior que zero.');
      }

      const users = await prisma.user.findMany({
        take: pageData.limit,
        orderBy: { name: 'asc' },
        skip: pageData.offset,
      });

      const lastUser = pageData.offset + pageData.limit;
      const totalUsers = await prisma.user.count();
      const hasNextPage = lastUser < totalUsers;

      const hasPreviousPage = pageData.offset > 0;

      return { users, totalUsers, hasNextPage, hasPreviousPage };
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

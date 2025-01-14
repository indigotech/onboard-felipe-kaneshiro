import { UserInput, User } from '../types/types';

let currentId = 1;

export const resolvers = {
  Query: {
    users: (): User[] => {
        return [];
    },
  },

  Mutation: {
    createUser: (_: unknown, args: { userData: UserInput }) => {
      const newUser: User = {
          id: currentId++,
          name: args.userData.name,
          email: args.userData.email,
          birthDate: args.userData.birthDate,
      };

      return newUser;
    },
  },
};

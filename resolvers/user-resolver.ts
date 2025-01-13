import { UserInput, User } from '../types/types';

let currentId = 1;
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
    createUser: (_: unknown, args: { userData: UserInput }) => {
      const newUser: User = {
        id: currentId++,
        name: args.userData.name,
        email: args.userData.email,
        birthDate: args.userData.birthDate,
      };

      usersList.push(newUser);
      return newUser;
    },
  },
};

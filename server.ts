import { ApolloServer } from 'apollo-server';
import { resolvers } from './resolvers/user-resolver';
import { typeDefs } from './types/types';

export const server = new ApolloServer({
  typeDefs,
  resolvers,
});

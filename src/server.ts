import { ApolloServer } from 'apollo-server';
import { resolvers } from './resolvers/user-resolver';
import { typeDefs } from './types/types';
import { formatError } from './errors/format-error';

export const server = new ApolloServer({
  typeDefs,
  resolvers,
  formatError,
});

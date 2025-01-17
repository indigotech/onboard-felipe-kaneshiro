import { ApolloServer } from 'apollo-server';
import { resolvers } from './resolvers/user-resolver';
import { typeDefs } from './types/types';
import { formatError } from './errors/format-error';
import jwt from 'jsonwebtoken';

const userAuthenticated = (token: string) => {
try { 
    return jwt.verify(token, process.env.JWT_SECRET as string);
  } catch {
    return null
    
  }
};

export const server = new ApolloServer({
  typeDefs,
  resolvers,
  formatError,
  context: ({ req }) => {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.replace('Bearer ', '');
    const user = token ? userAuthenticated(token) : null;
    return { user };
  },
});

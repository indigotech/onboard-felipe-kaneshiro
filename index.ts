// index.ts
import { ApolloServer } from 'apollo-server';
import { resolvers } from './resolvers/user-resolver';
import { typeDefs } from './types/types';
import prisma from './prisma';

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

(async () => {
  try {
    await prisma.$connect();
    console.log('Database connected successfully.');

    const { url } = await server.listen();
    console.log(`Server ready at ${url}`);
  } catch (error) {
    console.error('Failed to connect to the database:', error);
    process.exit(1);
  }
})();
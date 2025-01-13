// index.ts
import { ApolloServer } from 'apollo-server';
import { resolvers } from './resolvers/user-resolver';
import { typeDefs } from './types/types';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function startServer() {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: {
      prisma,
    },
  });

  const { url } = await server.listen({ port: 4000 });
  console.log(`Server ready at ${url}`);
}

startServer().catch((error) => {
  console.error('Error starting server:', error);
});

// index.ts
import { ApolloServer } from 'apollo-server';
import { resolvers } from './resolvers/user-resolver';
import { typeDefs } from './types/types';

async function startServer() {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });

  const { url } = await server.listen({ port: 4000 });
  console.log(`Server ready at ${url}`);
}

startServer().catch((error) => {
  console.error('Error starting server:', error);
});

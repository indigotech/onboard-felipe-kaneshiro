import {  server } from './server';
import prisma from './prisma';

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

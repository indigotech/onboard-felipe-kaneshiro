import { server } from '../src/server';
import prisma from '../src/prisma';

console.log(process.env.TEST_DATABASE_URL);

before(async () => {
  await server.listen({ port: 4000 });
  console.log('Server started successfully at http://localhost:4000');
});

after(async () => {
  await prisma.$disconnect();
  await server.stop();
  console.log('Server stopped');
});

import './create-user-mutation-test';

import { server } from '../src/server';
import prisma from '../src/prisma';

console.log(process.env.TEST_DATABASE_URL);

before(async () => {
  await prisma.$connect();
  await server.listen();
});

after(async () => {
  await prisma.$disconnect();
  await server.stop();
  console.log('Server stopped');
});

import './prisma-test';
import './query-test';
import './create-user-mutation-test';

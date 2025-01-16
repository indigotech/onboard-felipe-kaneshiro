import prisma from '../src/prisma';
import { server } from '../src/server';

before(async () => {
  await prisma.$connect();
  await server.listen();
});

after(async () => {
  await prisma.$disconnect();
  await server.stop();
});

import './query-test';

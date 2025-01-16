import prisma from '../src/prisma';
import { server } from '../src/server';

before(async () => {
  await server.listen();
});

after(async () => {
  await prisma.$disconnect();
  await server.stop();
});

import './query-test';
import './prisma-test';

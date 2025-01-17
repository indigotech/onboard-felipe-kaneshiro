import { server } from '../src/server';
import prisma from '../src/prisma';

before(async () => {
  await prisma.$connect();
  await server.listen({ port: 4000 });
  console.log('Server started successfully at http://localhost:4000');
});

after(async () => {
  await prisma.$disconnect();
  await server.stop();
});

import './create-user-mutation-test';
import './login-mutation-test';

import prisma from '../src/prisma';

describe('Prisma Connection Test', () => {
  it('should connect to the Prisma database', async () => {
    await prisma.$connect();
    console.log('Database connected successfully.');
  });
});

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const newUser = await prisma.user.create({
    data: {
      email: 'eduardoemail@hotmail.com',
      name: 'Eduardo',
      password: '123', 
      birthDate: new Date('1990-01-01'),
    },
  });
  console.log('New user has been created', newUser);
}

main()
  .catch(e => {
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

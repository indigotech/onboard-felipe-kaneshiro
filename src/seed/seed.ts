import { faker } from '@faker-js/faker';
import prisma from '../prisma';
import bcrypt from 'bcrypt';
import { User } from '../types/types';

export async function seed(): Promise<User[]> {
  try {
    await prisma.user.deleteMany();
    await prisma.address.deleteMany();

    const users = [];

    users.push({
      name: 'Admin',
      email: 'admin@admin.com',
      password: await bcrypt.hash('admin123', 10),
      birthDate: new Date('2001-01-01'),
      addresses: [
        {
          cep: '00000-000',
          street: 'Admin Street',
          streetNumber: 123,
          complement: 'Admin Complement',
          neighborhood: 'Admin Neighborhood',
          city: 'Admin City',
          state: 'ADMIN',
        },
      ],
    });

    const password = await bcrypt.hash('test123', 10);

    for (let i = 0; i < 50; i++) {
      const randomName = faker.internet.username();
      const randomEmail = 'seed' + i + '@seed.com';
      const fixedPassword = password;
      const randomBirthDate = faker.date.birthdate({ min: 2000, max: 2024, mode: 'year' });
      const randomAddress = [
        {
          cep: faker.location.zipCode(),
          street: faker.location.street(),
          streetNumber: Number(faker.location.buildingNumber()),
          complement: faker.location.secondaryAddress(),
          neighborhood: 'Neighborhood X',
          city: faker.location.city(),
          state: faker.location.state(),
        },
      ];

      users.push({
        name: randomName,
        email: randomEmail,
        password: fixedPassword,
        birthDate: randomBirthDate,
        addresses: randomAddress,
      });
    }

    const createdUsers: User[] = [];

    for (const user of users) {
      const newUser = await prisma.user.create({
        data: {
          name: user.name,
          email: user.email,
          password: user.password,
          birthDate: user.birthDate,
          addresses: {
            create: user.addresses,
          },
        },
        include: { addresses: true },
      });
      createdUsers.push(newUser);
    }

    return createdUsers.sort((a, b) => a.name.localeCompare(b.name));
  } catch (error) {
    console.error('Error seeding the database:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

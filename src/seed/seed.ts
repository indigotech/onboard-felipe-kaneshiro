import prisma from '../prisma';
import bcrypt from 'bcrypt';
import { faker } from '@faker-js/faker';

async function seed() {
    try {
        await prisma.user.deleteMany();

        for (let i = 0; i < 50; i++) {
            const randomName = faker.internet.username();
            const randomEmail = faker.internet.email();
            const randomPassword = faker.internet.password({ length: 10, prefix: "a1" });
            const randomHashedPassword = await bcrypt.hash(randomPassword, 10);
            const randomBirthDate = faker.date.birthdate({ min: 2000, max: 2024, mode: 'year' });

            await prisma.user.create({
                data: {
                    name: randomName,
                    email: randomEmail,
                    password: randomHashedPassword,
                    birthDate: randomBirthDate,
                },
            })
        }
    } catch (error) {
        console.error('Error seeding the database:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}
seed();

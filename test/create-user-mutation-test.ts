import axios from "axios";
import { compare } from "bcrypt";
import { expect } from "chai";
import { UserInput } from "../src/types/types";
import prisma from "../src/prisma";

describe('Create User Mutation', () => {
    it('should create a user successfully', async () => {
        console.log('User Creation Test');

        const newUser: UserInput = {
            name: 'Test User Name',
            email: 'test@gmail.com',
            password: 'testpass123',
            birthDate: '2001-01-01',
        };

        const userData = {
            query: ` 
            mutation Mutation($data: UserInput!) {
                createUser(userData: $data) {
                    id
                    name
                    password
                    email
                    birthDate
                }
            }
            `,
            variables: { data: newUser },
        };

        console.log('Sending request to the server...');
        
        const response = await axios.post('http://localhost:4000', userData);

        console.log('Server response received:', response.data);
        
        expect(response.data.data.createUser.name).to.be.deep.eq(newUser.name);
        expect(response.data.data.createUser.email).to.be.deep.eq(newUser.email);

        const expectedBirthDateInMs = new Date(newUser.birthDate).getTime();
        expect(Number(response.data.data.createUser.birthDate)).to.be.deep.eq(expectedBirthDateInMs);

        expect(await compare(newUser.password, response.data.data.createUser.password)).to.be.deep.eq(true);

        
        const savedUser = await prisma.user.findUnique({
            where: { email: newUser.email },
        });

        if (savedUser) {
            console.log('User created in the database:', savedUser);
            await prisma.user.delete({ where: { id: savedUser.id } });
        }
    });
});

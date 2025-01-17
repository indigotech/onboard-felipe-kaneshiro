/* eslint-disable @typescript-eslint/no-unused-expressions */
import axios from 'axios';
import { compare } from 'bcrypt';
import { expect } from 'chai';
import { UserInput } from '../src/types/types';
import prisma from '../src/prisma';
import bcrypt from 'bcrypt';

describe('Create User Mutation', () => {
  beforeEach(async () => {
    await prisma.user.deleteMany();
  });

  it('should create a user successfully', async () => {
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
            email
            birthDate
          }
        }
      `,
      variables: { data: newUser },
    };

    const response = await axios.post('http://localhost:4000', userData);

    const createdUser = response.data.data.createUser;
    const expectedBirthDateInMs = new Date(newUser.birthDate).getTime();

    expect(createdUser).to.deep.eq({
      id: createdUser.id,
      name: newUser.name,
      email: newUser.email,
      birthDate: String(expectedBirthDateInMs),
    });

    const savedUser = await prisma.user.findUnique({ where: { email: newUser.email } });

    expect(savedUser!.name).to.eq(newUser.name);
    expect(savedUser!.email).to.eq(newUser.email);
    expect(savedUser!.birthDate.getTime()).to.be.eq(expectedBirthDateInMs);
    expect(await compare(newUser.password, savedUser!.password)).to.be.eq(true);
  
  });


  it("should return an error when trying to create a user with an existing email", async () => {
    const duplicateUser: UserInput = {
      name: "Test User",
      email: "duplicate@gmail.com",
      password: "testpass123",
      birthDate: "2001-01-01",
    };

    await prisma.user.create({
      data: {
        ...duplicateUser,
        birthDate: new Date(duplicateUser.birthDate),
        password: await bcrypt.hash(duplicateUser.password, 10),
      },
    });

    const userData = {
      query: `
        mutation Mutation($data: UserInput!) {
          createUser(userData: $data) {
            id
            name
            email
            birthDate
          }
        }
      `,
      variables: { data: duplicateUser },
    };

    const response = await axios.post("http://localhost:4000", userData).catch(err => err.response);
    
    expect(response.data.errors).to.exist;
    expect(response.data.errors[0].message).to.be.eq("Email inserido já está em uso.");
  });


  it("should return an error when the password is less than 6 characters long", async () => {
    const invalidPasswordUser: UserInput = {
      name: "Test User",
      email: "test@gmail.com",
      password: "ab12",
      birthDate: "2001-01-01",
    };

    const userData = {
      query: `
        mutation Mutation($data: UserInput!) {
          createUser(userData: $data) {
            id
            name
            email
          }
        }
      `,
      variables: { data: invalidPasswordUser },
    };

    const response = await axios.post("http://localhost:4000", userData).catch(error => error.response);

    expect(response.data.errors).to.exist;
    expect(response.data.errors[0].details).to.be.eq("A senha deve conter pelo menos 6 caracteres.");
  });


  it("should return an error when the password does not have 1 letter", async () => {
    const userWithNoLetter = {
      name: "Test User",
      email: "test@gmail.com",
      password: "123456",
      birthDate: "2001-01-01",
    };

    const userData = {
      query: `
        mutation Mutation($data: UserInput!) {
          createUser(userData: $data) {
            id
            name
            email
          }
        }
      `,
      variables: { data: userWithNoLetter },
    };

    const response = await axios.post("http://localhost:4000", userData).catch(error => error.response);

    expect(response.data.errors).to.exist;
    expect(response.data.errors[0].details).to.be.eq("A senha deve conter pelo menos 1 letra e 1 número.");
  });


  it("should return an error when the password does not have 1 number", async () => {
    const userWithNoNumber = {
      name: "Test User",
      email: "test@gmail.com",
      password: "abcdef",
      birthDate: "2001-01-01",
    };

    const userData = {
      query: `
        mutation Mutation($data: UserInput!) {
          createUser(userData: $data) {
            id
            name
            email
          }
        }
      `,
      variables: { data: userWithNoNumber },
    };

    const response = await axios.post("http://localhost:4000", userData).catch(error => error.response);

    expect(response.data.errors).to.exist;
    expect(response.data.errors[0].details).to.be.eq("A senha deve conter pelo menos 1 letra e 1 número.");
  });
});
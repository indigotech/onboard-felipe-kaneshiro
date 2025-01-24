/* eslint-disable @typescript-eslint/no-unused-expressions */
import { compare } from 'bcrypt';
import { expect } from 'chai';
import { UserInput } from '../src/types/types';
import { CREATE_USER_MUTATION } from './graphql/mutations';
import axios from 'axios';
import prisma from '../src/prisma';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

describe('Create User Mutation', () => {
  let authToken: string;

  beforeEach(async () => {
    authToken = jwt.sign({ userId: 1 }, process.env.JWT_SECRET as string, { expiresIn: '1h' });
  });

  afterEach(async () => {
    await prisma.user.deleteMany();
  });

  it('should create a user with 2 addresses successfully', async () => {
    const newUser: UserInput = {
      name: 'Test User',
      email: 'test@gmail.com',
      password: 'testpass123',
      birthDate: '2001-01-01',
      addresses: [
        {
          cep: '00000-000',
          street: 'Test Street',
          streetNumber: 123,
          neighborhood: 'Test Neighborhood',
          city: 'Test City',
          state: 'TEST',
        },
        {
          cep: '11111-111',
          street: 'Test Street 2',
          streetNumber: 456,
          neighborhood: 'Test Neighborhood 2',
          city: 'Test City 2',
          state: 'TEST 2',
        },
      ],
    };

    const userData = CREATE_USER_MUTATION(newUser);

    const headers = { Authorization: `Bearer ${authToken}` };

    const response = await axios.post('http://localhost:4000', userData, { headers }).catch((error) => error.response);

    const createdUser = response.data.data.createUser;
    const expectedBirthDateInMs = new Date(newUser.birthDate).getTime();

    expect(createdUser).to.deep.include({
      name: newUser.name,
      email: newUser.email,
      birthDate: String(expectedBirthDateInMs),
    });

    const savedUser = (await prisma.user.findUnique({
      where: { email: newUser.email },
      include: { addresses: true },
    }))!;

    expect(savedUser.name).to.eq(newUser.name);
    expect(savedUser.email).to.eq(newUser.email);
    expect(savedUser.birthDate.getTime()).to.be.eq(expectedBirthDateInMs);
    expect(await compare(newUser.password, savedUser.password)).to.be.eq(true);

    expect(savedUser.addresses).to.have.lengthOf(2);
    for (let index = 0; index < savedUser.addresses.length; index++) {
      expect(savedUser.addresses[index]).to.deep.include(newUser.addresses[index]);
    }
  });

  it('should return an error when trying to create a user with an existing email', async () => {
    const duplicateUser: UserInput = {
      name: 'Test User',
      email: 'duplicate@gmail.com',
      password: 'testpass123',
      birthDate: '2001-01-01',
      addresses: [],
    };

    await prisma.user.create({
      data: {
        ...duplicateUser,
        birthDate: new Date(duplicateUser.birthDate),
        password: await bcrypt.hash(duplicateUser.password, 10),
        addresses: { create: [] },
      },
    });

    const userData = CREATE_USER_MUTATION(duplicateUser);

    const headers = { Authorization: `Bearer ${authToken}` };

    const response = await axios.post('http://localhost:4000', userData, { headers }).catch((error) => error.response);

    expect(response.data.errors).to.exist;
    expect(response.data.errors[0].message).to.be.eq('Email inserido já está em uso.');
    expect(response.data.errors[0].code).to.be.eq(409);
    expect(response.data.errors[0].details).to.be.eq('Escolha um email diferente.');
  });

  it('should return an error when the password is less than 6 characters long', async () => {
    const invalidPasswordUser: UserInput = {
      name: 'Test User',
      email: 'test@gmail.com',
      password: '123',
      birthDate: '2001-01-01',
      addresses: [],
    };

    const userData = CREATE_USER_MUTATION(invalidPasswordUser);

    const headers = { Authorization: `Bearer ${authToken}` };

    const response = await axios.post('http://localhost:4000', userData, { headers }).catch((error) => error.response);

    expect(response.data.errors).to.exist;
    expect(response.data.errors[0].message).to.be.eq('Senha inválida');
    expect(response.data.errors[0].code).to.be.eq(400);
    expect(response.data.errors[0].details).to.be.eq('A senha deve conter pelo menos 6 caracteres.');
  });

  it('should return an error when the password does not have 1 letter', async () => {
    const userWithNoLetter: UserInput = {
      name: 'Test User',
      email: 'test@gmail.com',
      password: '123456',
      birthDate: '2001-01-01',
      addresses: [],
    };

    const userData = CREATE_USER_MUTATION(userWithNoLetter);

    const headers = { Authorization: `Bearer ${authToken}` };

    const response = await axios.post('http://localhost:4000', userData, { headers }).catch((error) => error.response);

    expect(response.data.errors).to.exist;
    expect(response.data.errors[0].message).to.be.eq('Senha inválida');
    expect(response.data.errors[0].code).to.be.eq(400);
    expect(response.data.errors[0].details).to.be.eq('A senha deve conter pelo menos 1 letra e 1 número.');
  });

  it('should return an error when the password does not have 1 number', async () => {
    const userWithNoNumber: UserInput = {
      name: 'Test User',
      email: 'test@gmail.com',
      password: 'abcdef',
      birthDate: '2001-01-01',
      addresses: [],
    };

    const userData = CREATE_USER_MUTATION(userWithNoNumber);

    const headers = { Authorization: `Bearer ${authToken}` };

    const response = await axios.post('http://localhost:4000', userData, { headers }).catch((error) => error.response);

    expect(response.data.errors).to.exist;
    expect(response.data.errors[0].message).to.be.eq('Senha inválida');
    expect(response.data.errors[0].code).to.be.eq(400);
    expect(response.data.errors[0].details).to.be.eq('A senha deve conter pelo menos 1 letra e 1 número.');
  });

  it('should return an error when an invalid token is provided', async () => {
    const anyUser: UserInput = {
      name: 'Test User',
      email: 'test@gmail.com',
      password: 'abcdef',
      birthDate: '2001-01-01',
      addresses: [],
    };
    const userData = CREATE_USER_MUTATION(anyUser);

    const headers = { Authorization: 'Bearer invalid.token.here' };

    const response = await axios.post('http://localhost:4000', userData, { headers }).catch((error) => error.response);

    expect(response.data.errors).to.exist;
    expect(response.data.errors[0].message).to.eq('Usuário não autenticado ou tempo de login expirado.');
    expect(response.data.errors[0].code).to.eq(401);
    expect(response.data.errors[0].details).to.eq('Faça login para continuar.');
  });
});

import { expect } from 'chai';
import { User } from '@prisma/client';
import { USER_QUERY } from './graphql/queries';
import prisma from '../src/prisma';
import axios from 'axios';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

describe('User Query', () => {
  let createdUser: User;
  let authToken: string;

  const USER_TEST_EMAIL = 'testuserquery@gmail.com';
  const USER_TEST_PASSWORD = 'testuserquery123';

  beforeEach(async () => {
    const hashedPassword = await bcrypt.hash(USER_TEST_PASSWORD, 10);

    createdUser = await prisma.user.create({
      data: {
        name: 'Test User Query',
        email: USER_TEST_EMAIL,
        password: hashedPassword,
        birthDate: new Date('2001-01-01'),
        addresses: {
          create: [
            {
              cep: '12345-678',
              street: 'Test Street 2',
              streetNumber: 123,
              neighborhood: 'Test Neighborhood 2',
              city: 'Test City 1',
              state: 'TS',
            },
            {
              cep: '98765-432',
              street: 'Test Street 1',
              streetNumber: 456,
              neighborhood: 'Test Neighborhood 2',
              city: 'Test City 2',
              state: 'TS',
            },
          ],
        },
      },
      include: { addresses: true },
    });

    authToken = jwt.sign({ userID: createdUser.id }, process.env.JWT_SECRET as string, { expiresIn: '1h' });
  });

  afterEach(async () => {
    await prisma.user.deleteMany();
  });

  it('should return a user successfully', async () => {
    const queryUser = USER_QUERY(createdUser.id);

    const headers = { Authorization: `Bearer ${authToken}` };
    const response = await axios.post('http://localhost:4000', queryUser, { headers });

    expect(response.data.data.user).to.deep.include({
      id: createdUser.id.toString(),
      name: createdUser.name,
      email: createdUser.email,
      birthDate: createdUser.birthDate.getTime().toString(),
    });

    const returnedUser = (await prisma.user.findUnique({
      where: { id: createdUser.id },
      include: { addresses: true },
    }))!;

    for (let index = 0; index < returnedUser.addresses.length; index++) {
      expect(response.data.data.user.addresses[index]).to.deep.include({
        id: returnedUser.addresses[index].id.toString(),
        cep: returnedUser.addresses[index].cep,
        street: returnedUser.addresses[index].street,
        streetNumber: returnedUser.addresses[index].streetNumber,
        neighborhood: returnedUser.addresses[index].neighborhood,
        city: returnedUser.addresses[index].city,
        state: returnedUser.addresses[index].state,
      });
    }
  });

  it('should return user not found on database', async () => {
    const queryUser = USER_QUERY(createdUser.id + 1);

    const headers = { Authorization: `Bearer ${authToken}` };
    const response = await axios.post('http://localhost:4000', queryUser, { headers }).catch((error) => error.response);

    expect(response.data.errors[0]).to.be.deep.eq({
      message: 'Usuário não encontrado.',
      code: 404,
      details: 'Tente novamente com um ID válido.',
    });
  });

  it('should return time expired', async () => {
    const shortTimetToken = jwt.sign({ id: createdUser.id }, process.env.JWT_SECRET as string, { expiresIn: '-10s' });

    const queryUser = USER_QUERY(createdUser.id);

    const headers = { Authorization: `Bearer ${shortTimetToken}` };
    const response = await axios.post('http://localhost:4000', queryUser, { headers }).catch((error) => error.response);

    expect(response.data.errors[0]).to.be.deep.eq({
      message: 'Usuário não autenticado ou tempo de login expirado.',
      code: 401,
      details: 'Faça login para continuar.',
    });
  });

  it('should return not authenticated user', async () => {
    const notAuthenticatedUser = USER_QUERY(createdUser.id);

    const headers = { Authorization: `Invalid Token` };
    const response = await axios
      .post('http://localhost:4000', notAuthenticatedUser, { headers })
      .catch((error) => error.response);

    expect(response.data.errors[0]).to.be.deep.eq({
      message: 'Usuário não autenticado ou tempo de login expirado.',
      code: 401,
      details: 'Faça login para continuar.',
    });
  });
});

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
      },
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

    expect(response.data.data.user).to.deep.eq({
      id: createdUser.id.toString(),
      name: createdUser.name,
      email: createdUser.email,
      birthDate: createdUser.birthDate.getTime().toString(),
    });
  });

  it('should return user not found on database', async () => {
    const queryUser = USER_QUERY(createdUser.id + 1);

    const headers = { Authorization: `Bearer ${authToken}` };
    const response = await axios.post('http://localhost:4000', queryUser, { headers }).catch((error) => error.response);

    expect(response.data.errors[0].message).to.eq('Usuário não encontrado.');
    expect(response.data.errors[0].code).to.eq(404);
    expect(response.data.errors[0].details).to.eq('Tente novamente com um ID válido.');
  });

  it('should return time expired', async () => {
    const shortTimetToken = jwt.sign({ id: createdUser.id }, process.env.JWT_SECRET as string, { expiresIn: '-10s' });

    const queryUser = USER_QUERY(createdUser.id);

    const headers = { Authorization: `Bearer ${shortTimetToken}` };
    const response = await axios.post('http://localhost:4000', queryUser, { headers }).catch((error) => error.response);

    expect(response.data.errors[0].message).to.eq('Usuário não autenticado ou tempo de login expirado.');
    expect(response.data.errors[0].code).to.eq(401);
    expect(response.data.errors[0].details).to.eq('Faça login para continuar.');
  });

  it('should return not authenticated user', async () => {
    const notAuthenticatedUser = USER_QUERY(createdUser.id);

    const headers = { Authorization: `Invalid Token` };
    const response = await axios
      .post('http://localhost:4000', notAuthenticatedUser, { headers })
      .catch((error) => error.response);

    expect(response.data.errors[0].message).to.eq('Usuário não autenticado ou tempo de login expirado.');
    expect(response.data.errors[0].code).to.eq(401);
    expect(response.data.errors[0].details).to.eq('Faça login para continuar.');
  });
});

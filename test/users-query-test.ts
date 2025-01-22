import { expect } from 'chai';
import { USERS_QUERY } from './graphql/queries';
import { seed } from '../src/seed/seedaddress';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import prisma from '../src/prisma';
import { User } from '../src/types/types';

describe('Users Query', function () {
  let authToken: string;
  let users: User[];

  this.beforeAll(async () => {
    users = await seed();
  });

  beforeEach(async () => {
    authToken = jwt.sign({ userID: 1 }, process.env.JWT_SECRET as string, { expiresIn: '1h' });
  });

  this.afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should return paginated users successfully', async () => {
    const limit = 10;
    const offset = 0;
    const queryUsers = USERS_QUERY({ limit, offset });

    const headers = { Authorization: `Bearer ${authToken}` };
    const response = await axios.post('http://localhost:4000', queryUsers, { headers });

    const returnedUsers = response.data.data.Users;

    expect(returnedUsers.users.length).to.eq(10);
    expect(returnedUsers.usersPreviousPage.hasMoreUsers).to.eq(false);
    expect(returnedUsers.usersPreviousPage.totalUsersInPage).to.eq(0);
    expect(returnedUsers.usersNextPage.hasMoreUsers).to.eq(true);
    expect(returnedUsers.usersNextPage.totalUsersInPage).to.eq(41);

    for (let i = 0; i < limit; i++) {
      expect(returnedUsers.users[i]).to.deep.include({
        id: users[i + offset].id.toString(),
        name: users[i + offset].name,
        email: users[i + offset].email,
        birthDate: users[i + offset].birthDate.getTime().toString(),
        addresses: users[i + offset].addresses.map((address) => ({
          ...address,
          id: address.id.toString(),
          userID: address.userID.toString(),
        })),
      });
    }
  });

  it('should return paginated users successfully for default values', async () => {
    const queryUsers = USERS_QUERY();

    const headers = { Authorization: `Bearer ${authToken}` };
    const response = await axios.post('http://localhost:4000', queryUsers, { headers });

    const returnedUsers = response.data.data.Users;

    expect(returnedUsers.users.length).to.eq(15);
    expect(response.data.data.Users.usersPreviousPage.hasMoreUsers).to.eq(false);
    expect(response.data.data.Users.usersPreviousPage.totalUsersInPage).to.eq(0);
    expect(response.data.data.Users.usersNextPage.hasMoreUsers).to.eq(true);
    expect(response.data.data.Users.usersNextPage.totalUsersInPage).to.eq(36);

    for (let i = 0; i < returnedUsers.users.length; i++) {
      expect(returnedUsers.users[i]).to.deep.include({
        id: users[i].id.toString(),
        name: users[i].name,
        email: users[i].email,
        birthDate: users[i].birthDate.getTime().toString(),
        addresses: users[i].addresses.map((address) => ({
          ...address,
          id: address.id.toString(),
          userID: address.userID.toString(),
        })),
      });
    }
  });

  it('should return paginated users with next and previous pages', async () => {
    const limit = 10;
    const offset = 10;
    const queryUsers = USERS_QUERY({ limit, offset });

    const headers = { Authorization: `Bearer ${authToken}` };
    const response = await axios.post('http://localhost:4000', queryUsers, { headers });

    const returnedUsers = response.data.data.Users;

    expect(returnedUsers.users.length).to.eq(10);
    expect(returnedUsers.usersPreviousPage.hasMoreUsers).to.eq(true);
    expect(returnedUsers.usersPreviousPage.totalUsersInPage).to.eq(10);
    expect(returnedUsers.usersNextPage.hasMoreUsers).to.eq(true);
    expect(returnedUsers.usersNextPage.totalUsersInPage).to.eq(31);

    for (let i = 0; i < limit; i++) {
      expect(returnedUsers.users[i]).to.deep.include({
        id: users[i + offset].id.toString(),
        name: users[i + offset].name,
        email: users[i + offset].email,
        birthDate: users[i + offset].birthDate.getTime().toString(),
        addresses: users[i + offset].addresses.map((address) => ({
          ...address,
          id: address.id.toString(),
          userID: address.userID.toString(),
        })),
      });
    }
  });

  it('should return paginated users at the last page', async () => {
    const limit = 11;
    const offset = 40;
    const queryUsers = USERS_QUERY({ limit, offset });

    const headers = { Authorization: `Bearer ${authToken}` };
    const response = await axios.post('http://localhost:4000', queryUsers, { headers });

    const returnedUsers = response.data.data.Users;

    expect(returnedUsers.users.length).to.eq(11);
    expect(returnedUsers.usersPreviousPage.hasMoreUsers).to.eq(true);
    expect(returnedUsers.usersPreviousPage.totalUsersInPage).to.eq(40);
    expect(returnedUsers.usersNextPage.hasMoreUsers).to.eq(false);
    expect(returnedUsers.usersNextPage.totalUsersInPage).to.eq(0);

    for (let i = 0; i < limit; i++) {
      expect(returnedUsers.users[i]).to.deep.include({
        id: users[i + offset].id.toString(),
        name: users[i + offset].name,
        email: users[i + offset].email,
        birthDate: users[i + offset].birthDate.getTime().toString(),
        addresses: users[i + offset].addresses.map((address) => ({
          ...address,
          id: address.id.toString(),
          userID: address.userID.toString(),
        })),
      });
    }
  });

  it('should return an error for invalid limit', async () => {
    const limit = -1;
    const offset = 0;
    const queryUsers = USERS_QUERY({ limit, offset });

    const headers = { Authorization: `Bearer ${authToken}` };
    const response = await axios
      .post('http://localhost:4000', queryUsers, { headers })
      .catch((error) => error.response);

    expect(response.data.errors[0]).to.deep.eq({
      message: 'Quantidade inválida.',
      code: 400,
      details: 'A quantidade de usuários deve ser maior que zero.',
    });
  });

  it('should return an error if user is not authenticated', async () => {
    const limit = 1;
    const offset = 0;
    const queryUsers = USERS_QUERY({ limit, offset });

    const headers = { Authorization: `Invalid Token` };
    const response = await axios
      .post('http://localhost:4000', queryUsers, { headers })
      .catch((error) => error.response);

    expect(response.data.errors[0]).to.deep.eq({
      message: 'Usuário não autenticado ou tempo de login expirado.',
      code: 401,
      details: 'Faça login para continuar.',
    });
  });
});

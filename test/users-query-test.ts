import { expect } from 'chai';
import { USERS_QUERY } from './graphql/queries';
import { seed } from '../src/seed/seed';
import jwt from 'jsonwebtoken';
import axios from 'axios';

describe('Users Query', function () {
  let authToken: string;

  beforeEach(async () => {
    await seed();
    authToken = jwt.sign({ userID: 1 }, process.env.JWT_SECRET as string, { expiresIn: '1h' });
  });

  it('should return paginated users successfully', async () => {
    const amount = 10;
    const skip = 0;
    const queryUsers = USERS_QUERY({ amount, skip });

    const headers = { Authorization: `Bearer ${authToken}` };
    const response = await axios.post('http://localhost:4000', queryUsers, { headers });

    expect(response.data.data.Users.users.length).to.eq(10);
    expect(response.data.data.Users.usersPreviousPage.hasMoreUsers).to.eq(false);
    expect(response.data.data.Users.usersPreviousPage.quantity).to.eq(0);
    expect(response.data.data.Users.usersNextPage.hasMoreUsers).to.eq(true);
    expect(response.data.data.Users.usersNextPage.quantity).to.eq(41);
  });

  it('should return paginated users successfully for default values', async () => {
    const queryUsers = USERS_QUERY();

    const headers = { Authorization: `Bearer ${authToken}` };
    const response = await axios.post('http://localhost:4000', queryUsers, { headers });

    expect(response.data.data.Users.users.length).to.eq(15);
    expect(response.data.data.Users.usersPreviousPage.hasMoreUsers).to.eq(false);
    expect(response.data.data.Users.usersPreviousPage.quantity).to.eq(0);
    expect(response.data.data.Users.usersNextPage.hasMoreUsers).to.eq(true);
    expect(response.data.data.Users.usersNextPage.quantity).to.eq(36);
  });

  it('should return an error for invalid amount', async () => {
    const amount = -1;
    const skip = 0;
    const queryUsers = USERS_QUERY({ amount, skip });

    const headers = { Authorization: `Bearer ${authToken}` };
    const response = await axios
      .post('http://localhost:4000', queryUsers, { headers })
      .catch((error) => error.response);

    expect(response.data.errors[0].message).to.eq('Quantidade inválida.');
    expect(response.data.errors[0].code).to.eq(400);
    expect(response.data.errors[0].details).to.eq('A quantidade de usuários deve ser maior que zero.');
  });

  it('should return an error if user is not authenticated', async () => {
    const amount = 1;
    const skip = 0;
    const queryUsers = USERS_QUERY({ amount, skip });

    const headers = { Authorization: `Invalid Token` };
    const response = await axios
      .post('http://localhost:4000', queryUsers, { headers })
      .catch((error) => error.response);

    expect(response.data.errors[0].message).to.eq('Usuário não autenticado ou tempo de login expirado.');
    expect(response.data.errors[0].code).to.eq(401);
    expect(response.data.errors[0].details).to.eq('Faça login para continuar.');
  });
});

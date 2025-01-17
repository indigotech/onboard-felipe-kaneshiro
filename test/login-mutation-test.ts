import axios from 'axios';
import { UserInput, LoginInput } from '../src/types/types';
import { expect } from 'chai';
import prisma from '../src/prisma';

describe('Login Mutation', () => {
  beforeEach(async () => {
    await prisma.user.deleteMany();
  });

  it('should login a user successfully', async () => {
    const newUser: UserInput = {
      name: 'Test User Name',
      email: 'logintest@gmail.com',
      password: 'test123',
      birthDate: '2001-01-01',
    };

    const createUserMutation = {
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

    const createUserResponse = await axios.post('http://localhost:4000', createUserMutation);

    const createdUser = createUserResponse.data.data.createUser;

    expect(createdUser).to.include({
      name: newUser.name,
      email: newUser.email,
    });

    const userCredentials: LoginInput = {
      email: 'logintest@gmail.com',
      password: 'test123',
    };

    const loginMutation = {
      query: `
        mutation Login($data: LoginInput!) {
          login(loginData: $data) {
            token
            user {
              id
              name
              email
              birthDate
            }
          }
        }
      `,
      variables: { data: userCredentials },
    };

    const loginResponse = await axios.post('http://localhost:4000', loginMutation);

    const loggedInUser = loginResponse.data.data.login.user;

    expect(loginResponse.data.data.login.token).to.be.a('string');

    expect(loggedInUser.name).to.be.eq(createdUser.name);
    expect(loggedInUser.email).to.be.eq(createdUser.email);
    expect(loggedInUser.id).to.be.eq(createdUser.id);
    expect(Number(loggedInUser.birthDate)).to.be.eq(new Date(newUser.birthDate).getTime());
    expect(loginResponse.data.data.login.token).to.be.eq('arroz');

    await prisma.user.delete({ where: { email: loggedInUser.email } });
  });

  it('should return an error when the email does not exist', async () => {
    const invalidUser: LoginInput = {
      email: 'notfound@gmail.com',
      password: 'test123',
    };

    const loginMutation = {
      query: `
        mutation Login($data: LoginInput!) {
          login(loginData: $data) {
            token
            user {
              id
              name
              email
            }
          }
        }
      `,
      variables: { data: invalidUser },
    };

    const response = await axios.post('http://localhost:4000', loginMutation).catch((error) => error.response);

    expect(response.data.errors[0].message).to.eq('Usuário não encontrado');
    expect(response.data.errors[0].code).to.be.eq(402);
  });

  it('should return an error when the password is incorrect', async () => {
    const newUser: UserInput = {
      name: 'Test User Name',
      email: 'logintest@gmail.com',
      password: 'test123',
      birthDate: '2001-01-01',
    };

    const createUserMutation = {
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

    const createUserResponse = await axios.post('http://localhost:4000', createUserMutation);

    const createdUser = createUserResponse.data.data.createUser;

    expect(createdUser).to.include({
      name: newUser.name,
      email: newUser.email,
    });

    const userCredentials: LoginInput = {
      email: newUser.email,
      password: 'wrongpassword',
    };

    const loginMutation = {
      query: `
        mutation Login($data: LoginInput!) {
          login(loginData: $data) {
            token
            user {
              id
              name
              email
            }
          }
        }
      `,
      variables: { data: userCredentials },
    };

    const response = await axios.post('http://localhost:4000', loginMutation).catch((error) => error.response);

    expect(response.data.errors[0].message).to.eq('Senha incorreta');
    expect(response.data.errors[0].code).to.be.eq(401);
  });
});

import axios from 'axios';
import { UserInput, LoginInput } from '../src/types/types';
import { expect } from 'chai';
import prisma from '../src/prisma';
import jwt from 'jsonwebtoken';

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

    const token = loginResponse.data.data.login.token;
    expect(jwt.verify(token, process.env.JWT_SECRET as string)).to.deep.include({ userId: Number(createdUser.id) });
  });
});
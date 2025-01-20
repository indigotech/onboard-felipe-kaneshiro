import { User, LoginInput } from '../src/types/types';
import { expect } from 'chai';
import axios from 'axios';
import prisma from '../src/prisma';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

describe('Login Mutation', () => {
  let createdUser: User;

  beforeEach(async () => {
    createdUser = await prisma.user.create({
      data: {
        name: "Test User Name",
        email: "logintest@gmail.com",
        password: await bcrypt.hash("test123", 10),
        birthDate: new Date("2001-01-01"),
      },
    });
  });
  
  afterEach(async () => {
    await prisma.user.deleteMany();
  });


  it('should login a user successfully', async () => {
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
    expect(Number(loggedInUser.id)).to.be.eq(createdUser.id);
    expect(Number(loggedInUser.birthDate)).to.be.eq(new Date(createdUser.birthDate).getTime());

    const token = loginResponse.data.data.login.token;
    expect(jwt.verify(token, process.env.JWT_SECRET as string)).to.deep.include({ userId: Number(createdUser.id) });
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
    expect(response.data.errors[0].code).to.be.eq(404);
    expect(response.data.errors[0].details).to.be.eq('Verifique o email e tente novamente.');
  });
  

  it('should return an error when the password is incorrect', async () => {
    const userCredentials: LoginInput = {
      email: 'logintest@gmail.com',
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
    expect(response.data.errors[0].details).to.be.eq('Verifique a senha e tente novamente.');
  });
});

import { gql } from 'apollo-server';

export const typeDefs = gql`
  type Query {
    user(id: ID!): User!
  }
  type Mutation {
    createUser(userData: UserInput!): User!
    login(loginData: LoginInput!): Login!
  }
  input UserInput {
    name: String!
    email: String!
    password: String!
    birthDate: String!
  }
  type User {
    id: ID!
    name: String!
    email: String!
    birthDate: String!
  }
  input LoginInput {
    email: String!
    password: String!
    rememberMe: Boolean
  }
  type Login {
    user: User!
    token: String!
  }
`;

export interface User {
  id: number;
  name: string;
  email: string;
  birthDate: Date;
}

export interface UserInput {
  name: string;
  email: string;
  password: string;
  birthDate: string;
}

export interface LoginInput {
  email: string;
  password: string;
  rememberMe?: boolean;
}

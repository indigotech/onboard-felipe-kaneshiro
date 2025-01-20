import { gql } from 'apollo-server';

export const typeDefs = gql`
  type Query {
    user(id: ID!): User!
    Users(pageData: PageInfoInput): PageInfo!
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
  type PageInfo {
    users: [User!]!
    usersPreviousPage: PageNavigation!
    usersNextPage: PageNavigation!
  }
  input PageInfoInput {
    amount: Int = 15
    skip: Int = 0
  }
  type PageNavigation {
    hasMoreUsers: Boolean!
    quantity: Int!
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

export interface PageInfo {
  users: User[];
  usersPreviousPage: PageNavigation;
  usersNextPage: PageNavigation;
}

export interface PageInfoInput {
  amount: number;
  skip: number;
}

export interface PageNavigation {
  hasMoreUsers: boolean;
  quantity: number;
}

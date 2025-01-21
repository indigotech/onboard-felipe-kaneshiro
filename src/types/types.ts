import { gql } from 'apollo-server';

export const typeDefs = gql`
  type Query {
    user(id: ID!): User!
    Users(pageData: PaginationInput): UserPagination!
  }
  type Mutation {
    createUser(userData: UserInput!): User!
    login(loginData: LoginInput!): Login!
  }
  type User {
    name: String!
    id: ID!
    email: String!
    birthDate: String!
  }
  input UserInput {
    name: String!
    email: String!
    password: String!
    birthDate: String!
  }
  type Login {
    user: User!
    token: String!
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
  type PageInfo {
    users: [User!]!
    usersPreviousPage: PaginationInfo!
    usersNextPage: PaginationInfo!
  }
  input PaginationInput {
    limit: Int = 15
    offset: Int = 0
  }
  type PaginationInfo {
    hasMoreUsers: Boolean!
    totalUsersInPage: Int!
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

export interface UserPagination {
  users: User[];
  usersPreviousPage: PaginationInfo;
  usersNextPage: PaginationInfo;
}

export interface PaginationInput {
  limit: number;
  offset: number;
}

export interface PaginationInfo {
  hasMoreUsers: boolean;
  totalUsersInPage: number;
}

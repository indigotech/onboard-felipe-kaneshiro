import { gql } from 'apollo-server';

export const typeDefs = gql`
  type Query {
    user(id: ID!): User!
    Users(pageData: PaginationInput = { limit: 15, offset: 0 }): UserPagination!
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
    addresses: [Address!]!
  }
  type User {
    id: ID!
    name: String!
    email: String!
    birthDate: String!
    addresses: [AddressInput!]!
  }
  input LoginInput {
    email: String!
    password: String!
    rememberMe: Boolean
  }
  type Address {
    id: ID!
    userID: ID!
    cep: String!
    street: String!
    streetNumber: Int!
    complement: String
    neighborhood: String!
    city: String!
    state: String!
  }
  input AddressInput {
    cep: String!
    street: String!
    streetNumber: Int!
    complement: String
    neighborhood: String!
    city: String!
    state: String!
  }
  type PageInfo {
    users: [User!]!
    totalUsers: Int!
    hasNextPage: Boolean!
    hasPreviousPage: Boolean!
  }
  input PaginationInput {
    limit: Int = 15
    offset: Int = 0
  }
`;

export interface User {
  id: number;
  name: string;
  email: string;
  birthDate: Date;
  addresses?: Address[];
}

export interface UserInput {
  name: string;
  email: string;
  password: string;
  birthDate: string;
  addresses: AddressInput[];
}

export interface Address {
  id: number;
  userID: number;
  cep: string;
  street: string;
  streetNumber: number;
  complement?: string | null;
  neighborhood: string;
  city: string;
  state: string;
}
export interface AddressInput {
  cep: string;
  street: string;
  streetNumber: number;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
}
export interface LoginInput {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface UserPagination {
  users: User[];
  totalUsers: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginationInput {
  limit: number;
  offset: number;
}

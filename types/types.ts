import { gql } from 'apollo-server';

export const typeDefs = gql`
  type Query {
    showUsersList: [User!]!
  }

  type Mutation {
    createUser(userData: UserInput!): User!
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
`;

export type User = {
  id: number;
  name: string;
  email: string;
  birthDate: string;
};

export type UserInput = {
  name: string;
  email: string;
  birthDate: string;
};
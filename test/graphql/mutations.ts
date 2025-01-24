import { UserInput } from '../../src/types/types';

export const CREATE_USER_MUTATION = (user: UserInput) => ({
  query: ` 
    mutation Mutation($userData: UserInput!) {
      createUser(userData: $userData) {
        id
        name
        email
        birthDate
        addresses {
          id
          cep
          street
          streetNumber
          complement
          neighborhood
          city
          state
        }
      }
    }
    `,
  variables: { userData: user },
});

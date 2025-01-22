import { PaginationInput } from '../../src/types/types';

export const USER_QUERY = (userId: number) => ({
  query: `
        query User($id: ID!) {
            user(id: $id) {
                id
                name
                email
                birthDate
                addresses {
                    id
                    cep
                    street
                    streetNumber
                    neighborhood
                    city
                    state
                }
            }
        }
    `,
  variables: { id: userId },
});

export const USERS_QUERY = (pageData?: PaginationInput) => ({
  query: `
        query Users($pageData: PaginationInput) {
          Users(pageData: $pageData) {
            usersPreviousPage {
              hasMoreUsers
              totalUsersInPage
            }
            usersNextPage {
              hasMoreUsers
              totalUsersInPage
            }
            users {
              name
              id
              email
              birthDate
              addresses {
                id
                userID
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
        }
    `,
  variables: pageData ? { pageData } : { pageData: {} },
});

import { PageInfoInput } from '../../src/types/types';

export const USER_QUERY = (userId: number) => ({
  query: `
        query User($id: ID!) {
            user(id: $id) {
                id
                name
                email
                birthDate
            }
        }
    `,
  variables: { id: userId },
});

export const USERS_QUERY = (pageData?: PageInfoInput) => ({
  query: `
        query Users($pageData: PageInfoInput!) {
            Users(pageData: $pageData) {
                users {
                    id
                    name
                    email
                    birthDate
                }
                usersPreviousPage {
                    hasMoreUsers
                    quantity
                }
                usersNextPage {
                    hasMoreUsers
                    quantity
                }
            }
        }
    `,
    variables: pageData ? { pageData } : { pageData: {} },
});

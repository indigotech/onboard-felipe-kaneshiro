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

import { ApolloServer } from "apollo-server"

// Pegar uma porta personaliada do ENV
const PORT = process.env.PORT || 4000;

// Definindo o Schema do GraphQL
const typeDefs = `
type User {
    firstname: String
    lastname: String
    age: Int
    address: String
}
type Query {
    users: [User]
    hello: String
}
`;

const resolvers = {
    Query: {
        users: () => [],
        hello: () => `Hello, world`,
    },
};


// Instancia do ApolloServer
const server = new ApolloServer({
    typeDefs,
    resolvers,
});


server.listen(PORT).then(({ url }) => {
    console.log (`Server ready at ${url}`);
});

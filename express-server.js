var express = require("express");
var { graphqlHTTP } = require("express-graphql");
var { buildSchema } = require("graphql");

var schema = buildSchema(`
  type Query {
    hello: String
  }
`);

var root = {
  hello: function () {
    return "Hello world!";
  },
};

var app = express();

app.use((req, res, next) => {
    console.log(`${req.method} request to ${req.url}`);
    next();
  });
  

app.use(
  "/graphql",
  graphqlHTTP({
    schema: schema,
    rootValue: root,
    graphiql: true,
  })
);

app.listen(4000)
console.log("Running a GraphQL API server at http://localhost:4000/graphql")


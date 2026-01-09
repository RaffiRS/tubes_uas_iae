require('dotenv').config();
const { ApolloServer } = require('apollo-server');
const fs = require('fs');
const auth = require('./auth');
const resolvers = require('./resolvers');

const typeDefs = fs.readFileSync('./schema.graphql', 'utf8');

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => {
    const user = auth(req);
    return { user };
  }
});

server.listen({ port: process.env.PORT }).then(({ url }) => {
  console.log(`Order Service ready at ${url}`);
});

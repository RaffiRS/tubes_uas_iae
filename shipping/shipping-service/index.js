require('dotenv').config();
const { ApolloServer } = require('apollo-server');
const fs = require('fs');
const resolvers = require('./resolvers');

const typeDefs = fs.readFileSync('./schema.graphql', 'utf8');

const server = new ApolloServer({ typeDefs, resolvers });

server.listen({ port: process.env.PORT }).then(({ url }) => {
  console.log(`Shipping Service ready at ${url}`);
});

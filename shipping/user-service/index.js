require('dotenv').config();
const { ApolloServer } = require('apollo-server');
const fs = require('fs');
const resolvers = require('./resolvers');
const jwt = require('jsonwebtoken');

const typeDefs = fs.readFileSync('./schema.graphql', 'utf8');

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => {
    const auth = req.headers.authorization || '';
    if (!auth) return {};
    try {
      const token = auth.replace('Bearer ', '');
      const user = jwt.verify(token, process.env.JWT_SECRET);
      return { user };
    } catch {
      return {};
    }
  }
});

server.listen({ port: process.env.PORT }).then(({ url }) => {
  console.log(`User Service ready at ${url}`);
});

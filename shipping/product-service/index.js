require('dotenv').config();
const { ApolloServer } = require('apollo-server');
const fs = require('fs');
const jwt = require('jsonwebtoken');;
const resolvers = require('./resolvers');

const typeDefs = fs.readFileSync('./schema.graphql', 'utf8');

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) return { user: null };

    const token = authHeader.replace('Bearer ', '');

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      return { user: decoded };
    } catch (err) {
      return { user: null };
    }
  },
  debug: true, // Enable debugging
  introspection: true, // Enable for ngrok
  playground: true // Enable GraphQL playground
});

server.listen({ port: process.env.PORT }).then(({ url }) => {
  console.log(`🚀 Product Service ready at ${url}`);
  console.log(`📚 GraphQL Playground: ${url}`);
});
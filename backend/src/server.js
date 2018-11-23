const express = require('express');
const morgan = require('morgan');
const compression = require('compression');

const { ApolloServer } = require('apollo-server-express');
const { importSchema } = require('graphql-import');

const typeDefs = importSchema('./src/schema.graphql');
const resolvers = require('./resolvers');
const db = require('./db/models');

const PORT = process.env.PORT || 4000;

const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
  context: req => ({
    ...req,
    db,
  }),
});

const app = express();

app.use(morgan('dev')).use(compression());

apolloServer.applyMiddleware({ app });

app.listen(PORT, err => {
  if (err) throw err;
  console.log(`Server is listening on ${PORT}`);
});

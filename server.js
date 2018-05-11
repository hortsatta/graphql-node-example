import express from 'express';
import bodyParser from 'body-parser';
import { graphqlExpress, graphiqlExpress } from 'apollo-server-express';
import { makeExecutableSchema } from 'graphql-tools';
import mongoose from 'mongoose';
require('dotenv').config();

import typeDefs from './src/schema';
import resolvers from './src/resolvers';

const server = express();
// set port with API_PORT from .env or 3001
server.set('port', process.env.API_PORT || 3001);
// make graphql schema from schema.js and resolvers.js file
const schema = makeExecutableSchema({
  typeDefs,
  resolvers
});
// connect to mongodb
mongoose.connect(process.env.DB_HOST);

// set graphql endpoint
server.use(
  '/graphql',
  bodyParser.json(),
  graphqlExpress({ schema })
);

// set graphiql endpoint
// for dev only
server.use('/graphiql', graphiqlExpress({ endpointURL: '/graphql' }));

// listen to port value
server.listen(server.get('port'), () => {
  console.log(`Server running on port ${server.get('port')}`);
});
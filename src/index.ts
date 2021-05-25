import 'reflect-metadata';
import * as path from 'path';

import { GraphQLServer } from 'graphql-yoga';
import { importSchema } from 'graphql-import';
import * as dotenv from 'dotenv';

import { resolvers } from './schema/resolvers';
import { sessionMiddleware } from './middleware/session';
import { serverOptions, SESSION_OPTIONS } from './utils/constants';
import session from 'express-session';

dotenv.config();
const typeDefs = importSchema(
  path.join(__dirname, './schema/typeDefs/userSchema.graphql'),
);

const context = (req: any) => ({
  req,
});

const server = new GraphQLServer({
  typeDefs,
  resolvers,
  context,
});

// session middleware
server.express.use(session(SESSION_OPTIONS));
server.express.use(sessionMiddleware);

server
  .start(serverOptions, ({ port }) => {
    console.log(`Server is running on localhost:${port}`);
  })
  .catch((error) => console.log(error));

import 'reflect-metadata';
import * as path from 'path';
import { GraphQLServer } from 'graphql-yoga';
import session from 'express-session';
import ms from 'ms';

import { importSchema } from 'graphql-import';
import * as argon2 from 'argon2';
import * as dotenv from 'dotenv';

import { ResolverMap } from './types/ResolverTypes';
import { Options } from './types/OptionsTypes';
import { User } from './entity/User';
import { Profile } from './entity/Profile';
import { GQL } from './generated/types';

const typeDefs = importSchema(path.join(__dirname, './schema.graphql'));
dotenv.config();

const resolvers: ResolverMap = {
  Query: {
    hello: (_, { name }: GQL.IHelloOnQueryArguments) =>
      `Hello ${name || 'World'}`,
    authHello: (_, __, { req }) => {
      if (!req.session.userId) {
        return `Could not find a Cookie for you to eat, Starve in agnoy :3`;
      }
      return `YIKES!! Cookies's been found. your Id is ${req.session.userId}`;
    },
    user: async (_, { id }: GQL.IUserOnQueryArguments) =>
      await User.findOne(id, { relations: ['profile'] }),
    users: async () => await User.find({ relations: ['profile'] }),
  },

  Mutation: {
    createUser: async (_, args: GQL.ICreateUserOnMutationArguments) => {
      const profile = Profile.create({ ...args.profile });
      await profile.save();

      const user = User.create(args);
      await user.save();
      return {
        ...user,
        profile,
      };
    },

    updateUser: async (
      _,
      { id, ...args }: GQL.IUpdateUserOnMutationArguments,
    ) => {
      try {
        await User.update(id, args);
      } catch (error) {
        return false;
      }
      return true;
    },

    deleteUser: async (_, { id }: GQL.IDeleteUserOnMutationArguments) => {
      try {
        await User.remove(id);
      } catch (error) {
        return false;
      }
      return true;
    },

    registerUser: async (
      _,
      args: GQL.IRegisterUserOnMutationArguments,
      { req, res },
    ) => {
      try {
        const password = await argon2.hash(args.password);
        const user = User.create({
          userName: args.username,
          password,
        });
        await user.save();

        req.session.userId = user.id;
        return true;
      } catch (error) {
        return res.send(error);
      }
    },
  },
};

const options: Options = {
  port: process.env.PORT || 3000,
  endpoint: '/graphql',
  playground: '/playground',
  cors: {
    credentials: true,
    origin: [process.env.DEVELOPMENT_HOST],
  },
};

const context = (req: any) => ({
  req,
});

const server = new GraphQLServer({
  typeDefs,
  resolvers,
  context,
});

// session middleware
server.express.use(
  session({
    name: 'qid',
    secret: process.env.SECRET,
    resave: true,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: ms('1d'),
    },
  }),
);

server.express.use((req: any, res, next) => {
  try {
    if (req.session) {
      console.log(req.session);
      return next();
    }
  } catch (error) {
    res.send(error);
  }
});

server
  .start(options, ({ port }) => {
    console.log(`Server is running on localhost:${port}`);
  })
  .catch((error) => console.log(error));

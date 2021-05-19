import 'reflect-metadata';
import * as path from 'path';
import { GraphQLServer } from 'graphql-yoga';

import { importSchema } from 'graphql-import';
import * as argon2 from 'argon2';
import * as jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';
import cookieParser from 'cookie-parser';

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
    authHello: (_, __, { userId }) => {
      if (!userId) {
        return `Could not find a Cookie for you to eat, Starve in agnoy :3`;
      }
      return `YIKES!! Cookies's been found. your Id is ${userId}`;
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
      { res },
    ) => {
      try {
        const password = await argon2.hash(args.password);
        const user = User.create({
          userName: args.username,
          password,
        });
        await user.save();

        const token = jwt.sign(
          {
            userId: user.id,
          },
          process.env.JWT_SECRET,
          { expiresIn: '7d' },
        );

        res.cookie('id', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
        });
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
  req: req.request,
  userId: req.userId,
});

const server = new GraphQLServer({
  typeDefs,
  resolvers,
  context,
});


server.express.use(cookieParser());
server.express.use((req: any, res, next) => {
  try {
    const { token } = req.cookies;
    if (token) {
      const { userId }: any = jwt.verify(token, process.env.JWT_SECRET);
      req.userId = userId;
    }
    return next();
  } catch (error) {
    res.send(error);
  }
});

server
  .start(options, ({ port }) => {
    console.log(`Server is running on localhost:${port}`);
  })
  .catch((error) => console.log(error));

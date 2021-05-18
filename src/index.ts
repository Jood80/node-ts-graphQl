import 'reflect-metadata';
import * as path from 'path';
import express from 'express';
// import expressPlayground from 'graphql-playground-middleware-express';
const {
  graphqlExpress,
  makeExecutableSchema,
} = require('apollo-server-express');

import { createConnection } from 'typeorm';
import { importSchema } from 'graphql-import';
import * as argon2 from 'argon2';
import * as jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';
import bodyParser from 'body-parser';
import * as cors from 'cors';

import { ResolverMap } from './types/ResolverTypes';
import { User } from './entity/User';
import { Profile } from './entity/Profile';
import { GQL } from './generated/types';

const typeDefs = importSchema(path.join(__dirname, './schema.graphql'));
dotenv.config();

const resolvers: ResolverMap = {
  Query: {
    hello: (_, { name }: GQL.IHelloOnQueryArguments) =>
      `Hello ${name || 'World'}`,
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

const app = express();

const options = {
  port: process.env.PORT || 4000,
};

const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
  options,
});

app.cors({
  credential: true,
  origin: process.env.DEVELOPMENT_HOST,
});

app.use(express.urlencoded({ extended: true }));

app.use(
  '/graphql',
  express.json(),
  graphqlExpress((_: any, res: any) => ({
    schema,
    context: { res },
  })),
);

app.get('/playground', expressPlayground({ endpoint: '/graphql' }));

app.listen(process.env.PORT || 3000)

createConnection()
  .then(() => {
    app.listen(() => console.log('Server is running on localhost:4000'));
  })
  .catch((error) => console.log(error));

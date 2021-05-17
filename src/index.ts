import 'reflect-metadata';
import { GraphQLServer } from 'graphql-yoga';
import { createConnection } from 'typeorm';
import { importSchema } from 'graphql-import';
import * as path from 'path';

import { ResolverMap } from './types/ResolverTypes';
import { User } from './entity/User';
import { Profile } from './entity/Profile';
import { GQL } from './generated/types';

const typeDefs = importSchema(path.join(__dirname, './schema.graphql'));

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
  },
};

const server = new GraphQLServer({ typeDefs, resolvers });
createConnection()
  .then(() => {
    server.start(() => console.log('Server is running on localhost:4000'));
  })
  .catch((error) => console.log(error));

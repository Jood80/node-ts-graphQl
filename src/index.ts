import 'reflect-metadata';
import { GraphQLServer } from 'graphql-yoga';
import { createConnection } from 'typeorm';
import { ResolverMap } from './types/ResolverTypes';
import { User } from './entity/User';
import { Profile } from './entity/Profile';

const typeDefs = `
  type User {
    id: Int!
    firstName: String!
    lastName: String!
    age: Int!
    email: String!
    isConfirmed: Boolean!
    profile: Profile
  }

  type Profile {
    id: Int
    gender: String!
    photo: String
  }

  type Query {
    hello(name: String): String!
    user(id: Int!): User!
    users: [User!]!
  }

  input ProfileInput {
    id: Int
    gender: String!
  }

  type Mutation {
    createUser(firstName: String!, lastName: String!, age: Int, email: String, isConfirmed: Boolean, profile: ProfileInput): User!
    updateUser(id: Int!, firstName: String, lastName: String, age: Int, email: String, isConfirmed: Boolean): Boolean
    deleteUser(id: Int!): Boolean

  }
`;

const resolvers: ResolverMap = {
  Query: {
    hello: (_, { name }) => `Hello ${name || 'World'}`,
    user: async (_, { id }) =>
      await User.findOne(id, { relations: ['profile'] }),
    users: async () => await User.find({ relations: ['profile'] }),
  },

  Mutation: {
    createUser: async (_, args) => {
      const profile = await Profile.save({ ...args.profile });
      const user = await User.save(args);
      user.profile = profile
      user.profile.id = profile.ProfileId

      return {
        ...user,
        profile,
      };
    },
    updateUser: async (_, { id, ...args }) => {
      try {
        await User.update(id, args);
      } catch (error) {
        return false;
      }
      return true;
    },
    deleteUser: async (_, { id }) => {
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

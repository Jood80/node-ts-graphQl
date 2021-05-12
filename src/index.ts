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
  }

  type Query {
    hello(name: String): String!
    user(id: Int!): User!
    users: [User!]!
  }

  type Mutation {
    createUser(firstName: String!, lastName: String!, age: Int!, email: String!, isConfirmed: Boolean!): User!
    updateUser(id: Int!, firstName: String, lastName: String, age: Int, email: String, isConfirmed: Boolean): Boolean
    deleteUser(id: Int!): Boolean

  }
`;

const resolvers: ResolverMap = {
  Query: {
    hello: (_, { name }) => `Hello ${name || 'World'}`,
    user: (_, { id }) => User.findOne({ where: { id } }),
    users: () => User.find(),
  },
  Mutation: {
    createUser: (_, args) => User.save(args),
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
  .then(async (connection) => {
    const profile = new Profile();
    profile.gender = 'Female';
    profile.photo = 'her.jpg';
    await connection.manager.save(profile);

    const user = new User();
    user.firstName = 'Banana';
    user.lastName = 'Smith';
    user.age = 5;
    user.email = 'Banana@gmail.com'
    
    user.profile = profile;
    await connection.manager.save(user);

    const userRepository = connection.getRepository(User);
    const users = await userRepository.find({ relations: ['profile'] });
    console.log({ users });

    server.start(() => console.log('Server is running on localhost:4000'));
  })
  .catch((error) => console.log(error));

import 'reflect-metadata';
import { GraphQLServer } from 'graphql-yoga';
import { createConnection } from 'typeorm';
import { User } from './entity/User';
import { ResolverMap } from './types/ResolverTypes';

const typeDefs = `
  type User {
    id: Int!
    firstName: String!
    lastName: String!
    age: int!
    email: String!
    isConfirmed: boolean!
  }

  type Query {
    hello(name:String): String!
    user(id: Int!): User!
    users: [User!]!
  }

  type Mutation {
    createUser(firstName: String!, lastName: String!, age: Int!, email: String!, isConfirmed: Boolean!): User!
    updateUser(firstName: String!, lastName: String!, age: Int!, email: String!, isConfirmed: Boolean!): Boolean
    deleteUser(id: Int!): Boolean

  }
`;

const resolvers: ResolverMap = {
  Query: {
    hello: (_, { name }) => `Hello ${name || 'World'}`,
    user: (parent, args, context, info) => ({}),
  },
};

const server = new GraphQLServer({ typeDefs, resolvers });
createConnection()
  .then(async (connection) => {
    console.log('Inserting a new user into the database...');
    const user = new User();
    user.firstName = 'Arya';
    user.lastName = 'Stark';
    user.age = 16;
    user.email = 'test5@gmail.com';
    user.isConfirmed = true;
    await connection.manager.save(user);
    console.log('Saved a new user with id: ' + user.id);

    console.log('Loading users from the database...');
    const users = await connection.manager.find(User);
    console.log('Loaded users: ', users);

    server.start(() => console.log('Server is running on localhost:4000'));
  })
  .catch((error) => console.log(error));

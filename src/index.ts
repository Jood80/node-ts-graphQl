import 'reflect-metadata';
import { GraphQLServer } from 'graphql-yoga';
import { createConnection } from 'typeorm';
import { User } from './entity/User';

const typeDefs = `
  type Query {
    hello(name:String): String!
  }
`;

const resolvers = {
  Query: {
    hello: (_: any, { name }: any) => `Hello ${name || 'World'}`,
  },
};

const server = new GraphQLServer({ typeDefs, resolvers });
createConnection()
  .then(async(connection) => {
    console.log('Inserting a new user into the database...');
    const user = new User();
    user.firstName = 'John';
    user.lastName = 'Snow';
    user.age = 25;
    user.email = 'test4@gmail.com';
    user.isConfirmed = true;
    await connection.manager.save(user);
    console.log('Saved a new user with id: ' + user.id);

    console.log('Loading users from the database...');
    const users = await connection.manager.find(User);
    console.log('Loaded users: ', users);

    server.start(() => console.log('Server is running on localhost:4000'));
  })
  .catch((error) => console.log(error));

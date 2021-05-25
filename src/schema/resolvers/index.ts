import { ResolverMap } from '../../types/ResolverTypes';
import { Query } from './query';
import { createUser, updateUser, deleteUser, registerUser } from './mutation';

export const resolvers: ResolverMap = {
  Query,
  Mutation: {
    createUser,
    updateUser,
    deleteUser,
    registerUser,
  },
};

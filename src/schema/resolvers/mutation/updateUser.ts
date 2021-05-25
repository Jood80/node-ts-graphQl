import { User } from '../../../entity/User';
import { GQL } from '../../../generated/types';

export const updateUser = async (
  _: any,
  { id, ...args }: GQL.IUpdateUserOnMutationArguments,
) => {
  try {
    await User.update(id, args);
  } catch (error) {
    return false;
  }
  return true;
};

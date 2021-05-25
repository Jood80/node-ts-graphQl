import { User } from '../../../entity/User';
import { GQL } from '../../../generated/types';

export const deleteUser = async (
  _: any,
  { id }: GQL.IDeleteUserOnMutationArguments,
) => {
  try {
    await User.remove(id);
  } catch (error) {
    return false;
  }
  return true;
};

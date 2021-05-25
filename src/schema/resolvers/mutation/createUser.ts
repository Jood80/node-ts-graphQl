import { Profile } from '../../../entity/Profile';
import { User } from '../../../entity/User';
import { GQL } from '../../../generated/types';

export const createUser = async (
  _: any,
  args: GQL.ICreateUserOnMutationArguments,
) => {
  const profile = Profile.create({ ...args.profile });
  await profile.save();

  const user = User.create(args);
  await user.save();
  return {
    ...user,
    profile,
  };
};

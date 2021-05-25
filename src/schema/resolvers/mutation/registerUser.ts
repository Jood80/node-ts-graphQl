import * as argon2 from 'argon2';

import { User } from '../../../entity/User';
import { GQL } from '../../../generated/types';

export const registerUser = async (
  _: any,
  args: GQL.IRegisterUserOnMutationArguments,
  { req, res }: any,
) => {
  try {
    const password = await argon2.hash(args.password);
    const user = User.create({
      userName: args.username,
      password,
    });
    await user.save();

    req.session.userId = user.id;
    return true;
  } catch (error) {
    return res.send(error);
  }
};

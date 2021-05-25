import { User } from '../../../entity/User';
import { GQL } from '../../../generated/types';

export const Query = {
  hello: (_: any, { name }: GQL.IHelloOnQueryArguments) =>
    `Hello ${name || 'World'}`,
  authHello: (_: any, __: any, { req }: any) => {
    if (!req.session.userId) {
      return `Could not find a Cookie for you to eat, Starve in agnoy :3`;
    }
    return `YIKES!! Cookies's been found. your Id is ${req.session.userId}`;
  },
  user: async (_: any, { id }: GQL.IUserOnQueryArguments) =>
    await User.findOne(id, { relations: ['profile'] }),
  users: async () => await User.find({ relations: ['profile'] }),
};

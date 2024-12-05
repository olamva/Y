import { IResolvers } from '@graphql-tools/utils';
import { User } from '../../models/user';

export const repostTypeResolvers: IResolvers = {
  Repost: {
    id: (parent) => {
      const id = parent._id || parent.id;
      if (!id) {
        throw new Error('ID not found on Repost object');
      }
      return id.toString();
    },
    __isTypeOf(obj: any, context: any, info: any) {
      return obj.originalType !== undefined;
    },
    mentionedUsers: async (parent) =>
      parent.mentionedUsers.map(async (id: string) => await User.findById(id)),
  },
};

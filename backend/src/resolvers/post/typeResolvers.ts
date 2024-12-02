import { IResolvers } from '@graphql-tools/utils';
import { User } from '../../models/user';

export const postTypeResolvers: IResolvers = {
  Post: {
    id: (parent) => {
      const id = parent._id || parent.id;
      if (!id) {
        throw new Error('ID not found on Post object');
      }
      return id.toString();
    },
    __isTypeOf(obj: any, context: any, info: any) {
      return obj.body !== undefined && obj.originalType === undefined;
    },
    hashTags: (parent) => parent.hashTags,
    mentionedUsers: (parent) => parent.mentionedUsers,
    author: async (parent) => {
      return await User.findById(parent.author);
    },
  },
};

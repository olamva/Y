import { IResolvers } from '@graphql-tools/utils';
import { User } from '../../models/user';

export const commentTypeResolvers: IResolvers = {
  Comment: {
    id: (parent) => {
      const id = parent._id || parent.id;
      if (!id) {
        throw new Error('ID not found on Post object');
      }
      return id.toString();
    },
    hashTags: (parent) => parent.hashTags,
    mentionedUsers: (parent) => parent.mentionedUsers,
    author: async (parent) => {
      return await User.findById(parent.author);
    },
    __isTypeOf(obj: any, context: any, info: any) {
      return obj.body !== undefined && obj.parentType !== undefined;
    },
  },
};

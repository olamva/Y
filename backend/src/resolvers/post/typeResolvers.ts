import { IResolvers } from '@graphql-tools/utils';
import { GraphQLUpload } from 'graphql-upload-minimal';
import { User } from '../../models/user';

export const postTypeResolvers: IResolvers = {
  Upload: GraphQLUpload,
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
  PostItem: {
    __resolveType(obj: any, context: any, info: any) {
      if (obj.originalType) {
        return 'Repost';
      }
      if (obj.body !== undefined) {
        return 'Post';
      }
      return null;
    },
  },
  Parent: {
    __resolveType(obj: any, context: any, info: any) {
      if (obj.parentType) {
        return 'Comment';
      }
      if (obj.body !== undefined) {
        return 'Post';
      }
      return null;
    },
  },
};

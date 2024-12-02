import { IResolvers } from '@graphql-tools/utils';
import { User } from '../../models/user';

export const userTypeResolvers: IResolvers = {
  User: {
    id: (parent) => {
      const id = parent._id || parent.id;
      if (!id) {
        throw new Error('ID not found on User object');
      }
      return id.toString();
    },
    followers: async (parent) => {
      return await User.find({ _id: { $in: parent.followers } });
    },
    following: async (parent) => {
      return await User.find({ _id: { $in: parent.following } });
    },
  },
};

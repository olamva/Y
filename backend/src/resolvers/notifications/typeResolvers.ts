import { IResolvers } from '@graphql-tools/utils';
import { User } from '../../models/user';

export const notificationTypeResolvers: IResolvers = {
  Notification: {
    sender: async (parent) => {
      return await User.findById(parent.sender);
    },
    recipient: async (parent) => {
      return await User.findById(parent.recipient);
    },
  },
};

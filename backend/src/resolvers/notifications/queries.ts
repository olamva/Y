import { IResolvers } from '@graphql-tools/utils';
import { AuthenticationError, UserInputError } from 'apollo-server-errors';
import { Notification } from '../../models/notification';
import { User } from '../../models/user';

export const notificationQueries: IResolvers = {
  Query: {
    getNotifications: async (_, { page, limit }, context) => {
      const NOTIFICATIONS_PER_PAGE = limit || 16;
      const skip = (page - 1) * NOTIFICATIONS_PER_PAGE;
      if (!context.user) {
        throw new AuthenticationError('You must be logged in to view notifications');
      }

      try {
        const user = await User.findById(context.user._id);

        if (!user) {
          throw new UserInputError('User not found');
        }
        const notifications = await Notification.find({ recipient: user._id })
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(NOTIFICATIONS_PER_PAGE);
        return notifications.filter((notification) => notification.sender);
      } catch (err) {
        throw new Error('Error fetching notifications');
      }
    },
  },
};

import { IResolvers } from '@graphql-tools/utils';
import { AuthenticationError, UserInputError } from 'apollo-server-errors';
import { Notification } from '../../models/notification';

export const notificationMutations: IResolvers = {
  Mutation: {
    deleteNotification: async (_, { id }, context) => {
      if (!context.user) {
        throw new AuthenticationError('You must be logged in to delete a notification');
      }

      const notification = await Notification.findById(id);
      if (!notification) return;

      if (!notification.recipient._id === context.user._id) {
        throw new AuthenticationError('You are not authorized to delete this notification');
      }

      await Notification.findByIdAndDelete(id);

      return notification;
    },
    deleteAllNotifications: async (_, __, context) => {
      if (!context.user) {
        throw new AuthenticationError('You must be logged in to delete notifications');
      }

      const notifications = await Notification.find({ recipient: context.user });
      if (!notifications) {
        throw new UserInputError('Notifications not found');
      }

      await Notification.deleteMany({ recipient: context.user });
      return notifications;
    },
  },
};

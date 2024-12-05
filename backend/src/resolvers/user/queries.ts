import { IResolvers } from '@graphql-tools/utils';
import { UserInputError } from 'apollo-server-errors';
import { User } from '../../models/user';

export const userQueries: IResolvers = {
  Query: {
    getUsers: async (_, { page, excludeFollowing }, context) => {
      const USERS_PER_PAGE = 16;
      const skip = (page - 1) * USERS_PER_PAGE;

      let query: any = { username: { $nin: ['admin', 'fredrik', 'cytest'] } };

      if (excludeFollowing && context.user) {
        query = {
          username: { $nin: ['admin', 'fredrik', 'cytest', context.user.username] },
          _id: { $nin: context.user.following },
        };
      }

      try {
        return await User.find(query).sort({ createdAt: -1, username: 1 }).skip(skip).limit(USERS_PER_PAGE);
      } catch (err) {
        throw new Error('Error fetching users');
      }
    },
    getUser: async (_, { username }) => {
      try {
        return await User.findOne({ username: username });
      } catch (err) {
        throw new Error('Error fetching user');
      }
    },
    searchUsers: async (_, { query, page, limit }) => {
      if (query.length > 40) {
        throw new UserInputError('Query can max be 40 characters');
      }

      const PAGE_SIZE = limit || 10;
      const pageNumber = parseInt(page, 10);
      if (isNaN(pageNumber) || pageNumber < 1) {
        throw new UserInputError('Page must be a positive integer');
      }
      const skip = (pageNumber - 1) * PAGE_SIZE;

      try {
        const searchQuery = query.startsWith('@') ? query.slice(1) : query;
        return await User.find({
          $or: [
            { username: { $regex: searchQuery, $options: 'i' } },
            { firstName: { $regex: query, $options: 'i' } },
            { lastName: { $regex: query, $options: 'i' } },
          ],
        })
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(PAGE_SIZE);
      } catch (err) {
        console.error('Search Users Error:', err);
        throw new Error('Error performing user search');
      }
    },
  },
};

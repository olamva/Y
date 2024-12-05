import { IResolvers } from '@graphql-tools/utils';
import { Comment } from '../../models/comment';

export const commentQueries: IResolvers = {
  Query: {
    getComments: async (_, { postID, page }) => {
      const COMMENTS_PER_PAGE = 10;
      const skip = (page - 1) * COMMENTS_PER_PAGE;

      try {
        const comments = await Comment.find({ parentID: postID })
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(COMMENTS_PER_PAGE)
          .populate('author');
        return comments.filter((comment) => comment.author);
      } catch (err) {
        throw new Error('Error fetching comments');
      }
    },

    getComment: async (_, { id }) => {
      try {
        const comment = await Comment.findById(id).populate('author');
        return comment;
      } catch (err) {
        throw new Error('Error fetching comment by ID');
      }
    },

    getCommentsByIds: async (_, { ids, page }) => {
      const limit = 10;
      try {
        const comments = await Comment.find({ _id: { $in: ids } })
          .sort({ createdAt: -1 })
          .skip((page - 1) * limit)
          .limit(limit)
          .populate('author');

        const validComments = comments.filter((comment) => comment.author);

        return validComments;
      } catch (err) {
        throw new Error('Error fetching comments by IDs');
      }
    },
  },
};

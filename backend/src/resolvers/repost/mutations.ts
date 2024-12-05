import { IResolvers } from '@graphql-tools/utils';
import { AuthenticationError, UserInputError } from 'apollo-server-errors';
import { Comment, CommentType } from '../../models/comment';
import { Notification } from '../../models/notification';
import { Post, PostType } from '../../models/post';
import { Repost } from '../../models/repost';
import { User } from '../../models/user';

export const repostMutations: IResolvers = {
  Mutation: {
    repost: async (_, { id, type }, { user }) => {
      if (!user) {
        throw new AuthenticationError('You must be logged in to repost');
      }

      // if this user has already reposted this post, throw an error
      const existingRepost = await Repost.findOne({ author: user.id, originalID: id });
      if (existingRepost) {
        throw new UserInputError('You have already reposted this post');
      }

      let originalPost: PostType | CommentType | null = null;

      if (type === 'Post') {
        originalPost = await Post.findById(id);
      } else if (type === 'Comment') {
        originalPost = await Comment.findById(id);
      }

      if (!originalPost) {
        throw new UserInputError('Post not found');
      }

      try {
        const repost = new Repost({
          author: user.id,
          originalID: originalPost._id,
          originalType: type,
        });

        await repost.save();

        originalPost.amtReposts += 1;
        await originalPost.save();

        await User.findByIdAndUpdate(user.id, { $push: { repostedPostIds: repost.originalID } });

        const originalAuthor = await User.findById(originalPost.author);

        if (originalAuthor && originalAuthor.id.toString() !== user._id.toString()) {
          const notification = new Notification({
            type: 'REPOST',
            postType: type.toLowerCase(),
            postID: id,
            recipient: originalAuthor,
            sender: user,
          });

          await notification.save();
        }

        const combinedPost = {
          id: repost.id,
          author: user,
          originalID: originalPost.id,
          originalType: type,
          originalAuthor,
          repostedAt: repost.repostedAt,
          body: originalPost.body,
          originalBody: originalPost.originalBody,
          amtLikes: originalPost.amtLikes,
          amtComments: originalPost.amtComments,
          amtReposts: originalPost.amtReposts,
          createdAt: originalPost.createdAt,
          imageUrl: originalPost.imageUrl,
          hashTags: originalPost.hashTags,
          mentionedUsers: originalPost.mentionedUsers,
        };

        return combinedPost;
      } catch (err) {
        throw new Error('Error reposting');
      }
    },
    unrepost: async (_, { id }, context) => {
      if (!context.user) {
        throw new AuthenticationError('You must be logged in to unrepost');
      }

      const user = await User.findById(context.user.id);

      if (!user) {
        throw new UserInputError('User not found');
      }

      const repost = await Repost.findOne({ author: user.id, originalID: id });

      if (!repost) {
        throw new UserInputError('Repost not found');
      }

      if (!repost.author.equals(user.id)) {
        throw new AuthenticationError('You are not authorized to unrepost this post');
      }

      let originalPost: PostType | CommentType | null = null;

      if (repost.originalType === 'Post') {
        originalPost = await Post.findById(id);
      } else if (repost.originalType === 'Comment') {
        originalPost = await Comment.findById(id);
      }

      if (!originalPost) {
        throw new UserInputError('Original post not found');
      }

      try {
        await Repost.findOneAndDelete({ originalID: id, author: user.id });

        originalPost.amtReposts -= 1;
        await originalPost.save();

        await User.findByIdAndUpdate(user.id, { $pull: { repostedPostIds: repost.originalID } });

        if (originalPost.author._id.toString() !== user.id.toString()) {
          await Notification.findOneAndDelete({
            type: 'REPOST',
            postType: repost.originalType.toLowerCase(),
            postID: id,
            sender: user,
            recipient: originalPost.author,
          });
        }

        return repost;
      } catch (err) {
        throw new Error('Error unreposting');
      }
    },
  },
};

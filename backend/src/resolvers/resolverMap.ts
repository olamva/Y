import { IResolvers } from '@graphql-tools/utils';
import { AuthenticationError, UserInputError } from 'apollo-server-errors';
import { GraphQLUpload } from 'graphql-upload-minimal';
import { Comment, CommentType } from '../models/comment';
import { Notification } from '../models/notification';
import { Post, PostType } from '../models/post';
import { Repost } from '../models/repost';
import { User } from '../models/user';

export const resolvers: IResolvers = {
  Upload: GraphQLUpload,

  Query: {
    getRepostsByUser: async (_, { username, page, limit }) => {
      const user = await User.findOne({ username });
      const REPOSTS_PER_PAGE = limit ?? 10;
      const skip = (page - 1) * REPOSTS_PER_PAGE;
      if (!user) {
        throw new UserInputError('User not found');
      }
      const reposts = await Repost.find({ author: user._id })
        .sort({ repostedAt: -1 })
        .skip(skip)
        .limit(REPOSTS_PER_PAGE)
        .populate('author');

      try {
        const repostedPosts = await Promise.all(
          reposts.map(async (repost) => {
            let originalPost: PostType | CommentType | null = null;
            if (repost.originalType === 'Post') {
              originalPost = await Post.findById(repost.originalID);
            } else if (repost.originalType === 'Comment') {
              originalPost = await Comment.findById(repost.originalID);
            }
            if (!originalPost) {
              throw new Error('Original post not found');
            }
            const originalAuthor = await User.findById(originalPost.author);

            return {
              id: repost._id,
              author: repost.author,
              originalID: originalPost._id,
              originalType: repost.originalType,
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
              parentID: (originalPost as CommentType).parentID,
              parentType: (originalPost as CommentType).parentType,
            };
          })
        );
        return repostedPosts;
      } catch (err) {
        throw new Error('Error fetching reposts by IDs');
      }
    },

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

    getParent: async (_, { parentID, parentType }) => {
      try {
        if (parentType === 'post') return await Post.findById(parentID).populate('author');
        else return await Comment.findById(parentID).populate('author');
      } catch (err) {
        throw new Error('Error fetching parent');
      }
    },
    getParentsByIds: async (_, { parents }) => {
      const fetchedParents: (PostType | CommentType)[] = [];
      try {
        await Promise.all(
          parents.map(async (parent: { id: string; type: string }) => {
            if (parent.type === 'post') {
              const post = await Post.findById(parent.id).populate('author');
              if (post && post.author) fetchedParents.push(post);
            } else {
              const comment = await Comment.findById(parent.id).populate('author');
              if (comment && comment.author) fetchedParents.push(comment);
            }
          })
        );
        return fetchedParents;
      } catch (err) {
        throw new Error('Error fetching parents');
      }
    },
  },

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

  Notification: {
    sender: async (parent) => {
      return await User.findById(parent.sender);
    },
    recipient: async (parent) => {
      return await User.findById(parent.recipient);
    },
  },

  Repost: {
    id: (parent) => {
      const id = parent._id || parent.id;
      if (!id) {
        throw new Error('ID not found on Repost object');
      }
      return id.toString();
    },
    __isTypeOf(obj: any, context: any, info: any) {
      return obj.originalType !== undefined;
    },
    mentionedUsers: async (parent) =>
      parent.mentionedUsers.map(async (id: string) => await User.findById(id)),
  },
};

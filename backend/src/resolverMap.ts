import { IResolvers } from '@graphql-tools/utils';
import { AuthenticationError, UserInputError } from 'apollo-server-errors';
import { GraphQLUpload } from 'graphql-upload-minimal';
import { SortOrder, Types } from 'mongoose';
import { signToken } from './auth';
import { Comment, CommentType } from './models/comment';
import { Notification } from './models/notification';
import { Post, PostType } from './models/post';
import { Repost } from './models/repost';
import { User, UserType } from './models/user';
import { deleteFile, uploadFile } from './uploadFile';
import { extractHashtags, extractMentions } from './utils';

export const resolvers: IResolvers = {
  Upload: GraphQLUpload,

  Query: {
    getPosts: async (_, { page, filter, limit }, { user }) => {
      const POSTS_PER_PAGE = limit ?? 10;
      const skip = (page - 1) * POSTS_PER_PAGE;

      if (!user && filter === 'FOLLOWING') {
        throw new AuthenticationError('You must be logged in to view posts.');
      }

      try {
        let query: any = {};
        let sort: Record<string, SortOrder> = { createdAt: -1 };

        switch (filter) {
          case 'LATEST':
            query = {};
            break;

          case 'FOLLOWING':
            const followingIds = user.following.map((followedUser: UserType) => followedUser._id);
            query = { author: { $in: followingIds } };
            break;

          case 'POPULAR':
            sort = { amtLikes: -1, createdAt: -1 };
            query = {};
            break;

          case 'CONTROVERSIAL':
            sort = { amtComments: -1, createdAt: -1 };
            query = {};
            break;

          default:
            throw new UserInputError('Invalid filter type.');
        }

        const posts = await Post.find(query).sort(sort).skip(skip).limit(POSTS_PER_PAGE).populate('author');

        return posts;
      } catch (err) {
        console.error(err);
        throw new Error('Error fetching posts');
      }
    },
    getUsers: async (_, { page }) => {
      const USERS_PER_PAGE = 16;
      const skip = (page - 1) * USERS_PER_PAGE;

      try {
        User.updateMany({ $set: { verified: 'UNVERIFIED' } });
        return await User.find({ username: { $nin: ['admin', 'fredrik'] } })
          .sort({ createdAt: -1, username: 1 })
          .skip(skip)
          .limit(USERS_PER_PAGE);
      } catch (err) {
        throw new Error('Error fetching users');
      }
    },
    getPost: async (_, { id }) => {
      try {
        const post = await Post.findById(id).populate('author');
        return post;
      } catch (err) {
        throw new Error('Error fetching post');
      }
    },
    getReposts: async (_, { page, filter, limit }, { user }) => {
      const REPOSTS_PER_PAGE = limit ?? 10;
      const skip = (page - 1) * REPOSTS_PER_PAGE;

      if (!user && filter === 'FOLLOWING') {
        throw new AuthenticationError('You must be logged in to view posts.');
      }

      try {
        let query: any = {};
        let sort: Record<string, SortOrder> = { repostedAt: -1 };

        switch (filter) {
          case 'LATEST':
            query = {};
            break;

          case 'FOLLOWING':
            const followingIds = user.following.map((followedUser: UserType) => followedUser._id);
            query = { author: { $in: followingIds } };
            break;

          case 'POPULAR':
            sort = { amtLikes: -1, repostedAt: -1 };
            query = {};
            break;

          case 'CONTROVERSIAL':
            sort = { amtComments: -1, repostedAt: -1 };
            query = {};
            break;

          default:
            throw new UserInputError('Invalid filter type.');
        }

        const reposts = await Repost.find(query)
          .sort(sort)
          .skip(skip)
          .limit(REPOSTS_PER_PAGE)
          .populate('author');

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
              id: repost.id,
              author: repost.author,
              originalID: originalPost.id,
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
        throw new Error('Error fetching reposts');
      }
    },
    getRepostsByUser: async (_, { username, page, limit }) => {
      const user = await User.findOne({ username });
      const REPOSTS_PER_PAGE = limit ?? 10;
      const skip = (page - 1) * REPOSTS_PER_PAGE;
      if (!user) {
        throw new UserInputError('User not found');
      }
      const reposts = await Repost.find({ author: user?.id })
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
              id: repost.id,
              author: repost.author,
              originalID: originalPost.id,
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
    getUser: async (_, { username }) => {
      try {
        User.updateMany({ $set: { verified: 'UNVERIFIED' } });
        return await User.findOne({ username: username });
      } catch (err) {
        throw new Error('Error fetching user');
      }
    },
    getComments: async (_, { postID, page }) => {
      const COMMENTS_PER_PAGE = 10;
      const skip = (page - 1) * COMMENTS_PER_PAGE;

      try {
        return await Comment.find({ parentID: postID })
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(COMMENTS_PER_PAGE)
          .populate('author');
      } catch (err) {
        throw new Error('Error fetching comments');
      }
    },
    getPostsByIds: async (_, { ids, page, limit }) => {
      const POSTS_PER_PAGE = limit ?? 10;
      try {
        const posts = await Post.find({ _id: { $in: ids } })
          .sort({ createdAt: -1 })
          .skip((page - 1) * limit)
          .limit(limit)
          .populate('author');

        return posts;
      } catch (err) {
        throw new Error('Error fetching posts by IDs');
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
        return await Comment.find({ _id: { $in: ids } })
          .sort({ createdAt: -1 })
          .skip((page - 1) * limit)
          .limit(limit)
          .populate('author');
      } catch (err) {
        throw new Error('Error fetching comments by IDs');
      }
    },
    getNotifications: async (_, __, context) => {
      if (!context.user) {
        throw new AuthenticationError('You must be logged in to view notifications');
      }

      try {
        const user = await User.findById(context.user._id);

        if (!user) {
          throw new UserInputError('User not found');
        }
        return await Notification.find({ recipient: user._id }).sort({ createdAt: -1 });
      } catch (err) {
        throw new Error('Error fetching notifications');
      }
    },

    searchPosts: async (_: any, { query, page }: { query: string; page: string }) => {
      if (query.length > 40) {
        throw new UserInputError('Query can max be 40 characters');
      }

      const POSTS_PER_PAGE = 10;
      const pageNumber = parseInt(page, 10);
      if (isNaN(pageNumber) || pageNumber < 1) {
        throw new UserInputError('Page must be a positive integer');
      }
      const skip = (pageNumber - 1) * POSTS_PER_PAGE;

      try {
        const posts = await Post.aggregate([
          {
            $lookup: {
              from: 'users',
              localField: 'author',
              foreignField: '_id',
              as: 'authorDetails',
            },
          },
          { $unwind: '$authorDetails' },
          {
            $match: {
              $or: [
                { body: { $regex: query, $options: 'i' } },
                { 'authorDetails.username': { $regex: query, $options: 'i' } },
              ],
            },
          },
          { $sort: { createdAt: -1 } },
          { $skip: skip },
          { $limit: POSTS_PER_PAGE },
          {
            $project: {
              id: '$_id',
              body: 1,
              originalBody: 1,
              author: '$authorDetails',
              amtLikes: 1,
              amtComments: 1,
              createdAt: 1,
              imageUrl: 1,
            },
          },
        ]);

        return posts;
      } catch (err) {
        console.error('Search Posts Error:', err);
        throw new Error('Error performing search');
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
        return await User.find({ username: { $regex: query, $options: 'i' } })
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(PAGE_SIZE);
      } catch (err) {
        console.error('Search Users Error:', err);
        throw new Error('Error performing user search');
      }
    },
    searchHashtags: async (_, { query, page, limit }) => {
      if (query.length > 40) {
        throw new UserInputError('Query can be a maximum of 40 characters.');
      }

      const PAGE_SIZE = limit || 10;
      const pageNumber = parseInt(page, 10);
      if (isNaN(pageNumber) || pageNumber < 1) {
        throw new UserInputError('Page must be a positive integer.');
      }
      const skip = (pageNumber - 1) * PAGE_SIZE;

      try {
        const postHashtags = await Post.aggregate([
          { $unwind: '$hashTags' },
          {
            $match: {
              hashTags: { $regex: query, $options: 'i' },
            },
          },
          {
            $group: {
              _id: { $toLower: '$hashTags' },
              count: { $sum: 1 },
            },
          },
        ]);

        const commentHashtags = await Comment.aggregate([
          { $unwind: '$hashTags' },
          {
            $match: {
              hashTags: { $regex: query, $options: 'i' },
            },
          },
          {
            $group: {
              _id: { $toLower: '$hashTags' },
              count: { $sum: 1 },
            },
          },
        ]);

        const combined = [...postHashtags, ...commentHashtags];
        const hashtagMap = new Map<string, number>();

        combined.forEach((item) => {
          const tag = item._id;
          const count = item.count;
          if (hashtagMap.has(tag)) {
            hashtagMap.set(tag, hashtagMap.get(tag)! + count);
          } else {
            hashtagMap.set(tag, count);
          }
        });

        const sortedHashtags = Array.from(hashtagMap, ([tag, count]) => ({
          tag,
          count,
        })).sort((a, b) => b.count - a.count);

        const paginatedHashtags = sortedHashtags.slice(skip, skip + PAGE_SIZE);

        return paginatedHashtags;
      } catch (err) {
        console.error('Search Hashtags Error:', err);
        throw new Error('Error performing hashtag search.');
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
              if (post) fetchedParents.push(post);
            } else {
              const comment = await Comment.findById(parent.id).populate('author');
              if (comment) fetchedParents.push(comment);
            }
          })
        );
        return fetchedParents;
      } catch (err) {
        throw new Error('Error fetching parents');
      }
    },
    getTrendingHashtags: async (_, { page }, context) => {
      const HASHTAGS_PER_PAGE = 16;
      const pageNumber = parseInt(page, 16);

      if (isNaN(pageNumber) || pageNumber < 1) {
        throw new UserInputError('Page must be a positive integer');
      }

      const skip = (pageNumber - 1) * HASHTAGS_PER_PAGE;

      try {
        const postHashtags = await Post.aggregate([
          { $unwind: '$hashTags' },
          {
            $project: {
              hashTags: { $toLower: '$hashTags' },
            },
          },
          {
            $group: {
              _id: '$hashTags',
              count: { $sum: 1 },
            },
          },
        ]);

        const commentHashtags = await Comment.aggregate([
          { $unwind: '$hashTags' },
          {
            $project: {
              hashTags: { $toLower: '$hashTags' },
            },
          },
          {
            $group: {
              _id: '$hashTags',
              count: { $sum: 1 },
            },
          },
        ]);

        const combined = [...postHashtags, ...commentHashtags];

        const hashtagMap = new Map();

        combined.forEach((item) => {
          const tag = item._id;
          const count = item.count;
          if (hashtagMap.has(tag)) {
            hashtagMap.set(tag, hashtagMap.get(tag) + count);
          } else {
            hashtagMap.set(tag, count);
          }
        });

        const sortedHashtags = Array.from(hashtagMap, ([tag, count]) => ({
          tag,
          count,
        })).sort((a, b) => {
          if (b.count === a.count) {
            return a.tag.localeCompare(b.tag);
          }
          return b.count - a.count;
        });

        const paginatedHashtags = sortedHashtags.slice(skip, skip + HASHTAGS_PER_PAGE);

        return paginatedHashtags;
      } catch (error) {
        console.error('Error fetching trending hashtags:', error);
        throw new Error('Failed to fetch trending hashtags');
      }
    },

    getContentByHashtag: async (_, { hashtag, page }, context) => {
      const PAGE_SIZE = 10;

      try {
        if (!hashtag || typeof hashtag !== 'string') {
          throw new UserInputError('Invalid hashtag provided');
        }

        const normalizedHashtag = hashtag.toLowerCase();
        const skip = (page - 1) * PAGE_SIZE;
        const limit = PAGE_SIZE;

        const postsPromise = Post.find({ hashTags: normalizedHashtag })
          .sort({ createdAt: -1 })
          .populate('author');

        const commentsPromise = Comment.find({ hashTags: normalizedHashtag })
          .sort({ createdAt: -1 })
          .populate('author');

        const [posts, comments] = await Promise.all([postsPromise, commentsPromise]);

        const combined = [...posts, ...comments].sort(
          (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
        );

        const paginatedResults = combined.slice(skip, skip + limit);

        return paginatedResults;
      } catch (error) {
        console.error(`Error fetching posts and comments for hashtag "${hashtag}":`, error);
        throw new Error('Failed to fetch posts and comments by hashtag');
      }
    },
  },

  Mutation: {
    createPost: async (_, { body, file }, context) => {
      if (!context.user) {
        throw new AuthenticationError('You must be logged in to create a post');
      }

      if (body.length < 1 && !file) {
        throw new UserInputError('Comment must have a body or an image');
      }

      const user = await User.findById(context.user.id);

      if (!user) {
        throw new UserInputError('User not found');
      }
      if (body.length > 281) {
        throw new UserInputError('Post body exceeds 281 characters');
      }

      let imageUrl = null;

      if (file) {
        try {
          const result = await uploadFile(file);
          imageUrl = result.url;
        } catch (err) {
          throw new Error('Error uploading file');
        }
      }

      const hashTags = body ? extractHashtags(body) : [];
      const mentionedUsers = body ? await extractMentions(body) : [];

      try {
        const newPost = new Post({ body, author: user.id, imageUrl, hashTags, mentionedUsers });
        const savedPost = await newPost.save();

        user.postIds.push(savedPost.id);
        await user.save();

        if (mentionedUsers) {
          mentionedUsers.forEach(async (id) => {
            const user = await User.findById(id);
            if (!user) return;
            user.mentionedPostIds.push(savedPost.id);

            if (user.id !== savedPost.author) {
              const notification = new Notification({
                type: 'MENTION',
                postType: 'post',
                postID: savedPost.id,
                recipient: user,
                sender: savedPost.author,
              });

              await notification.save();
            }

            return await user.save();
          });
        }

        return await savedPost.populate('author');
      } catch (err) {
        throw new Error('Error creating post');
      }
    },
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

        if (originalAuthor && originalAuthor._id !== user.id) {
          const notification = new Notification({
            type: 'REPOST',
            postType: type,
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
    unrepost: async (_, { id }, { user }) => {
      if (!user) {
        throw new AuthenticationError('You must be logged in to unrepost');
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

        if (originalPost.author !== user.id) {
          await Notification.findOneAndDelete({
            type: 'REPOST',
            postType: repost.originalType,
            postID: id,
            sender: user,
          });
        }

        return repost;
      } catch (err) {
        throw new Error('Error unreposting');
      }
    },
    updateProfile: async (_, { firstName, lastName, biography }, context) => {
      if (!context.user) {
        throw new AuthenticationError('You must be logged in to update profile');
      }

      const user = await User.findById(context.user.id);

      if (!user) {
        throw new UserInputError('User not found');
      }

      if (firstName && firstName.length > 20) {
        throw new UserInputError('First name must be at most 20 characters');
      }
      if (lastName && lastName.length > 20) {
        throw new UserInputError('Last name must be at most 20 characters');
      }

      if (biography && biography.length > 160) {
        throw new UserInputError('Biography must be at most 160 characters');
      }

      if (firstName) user.firstName = firstName;
      if (lastName) user.lastName = lastName;
      if (biography) user.biography = biography;

      await user.save();

      return user;
    },
    changeProfilePicture: async (_, { file }, context) => {
      if (!context.user) {
        throw new AuthenticationError('You must be logged in to change profile picture');
      }

      const user = await User.findById(context.user.id);

      if (!user) {
        throw new UserInputError('User not found');
      }

      if (user.profilePicture) {
        const deleteResult = await deleteFile(user.profilePicture);
        if (!deleteResult.success) {
          console.warn(`Failed to delete file: ${deleteResult.message}`);
        }
      }

      if (file) {
        try {
          const result = await uploadFile(file, user.username);
          user.profilePicture = result.url;
        } catch (err) {
          throw new Error('Error uploading file');
        }
      } else {
        user.profilePicture = undefined;
      }

      await user.save();
      return user;
    },

    changeBackgroundPicture: async (_, { file }, context) => {
      if (!context.user) {
        throw new AuthenticationError('You must be logged in to change background picture');
      }

      const user = await User.findById(context.user.id);

      if (!user) {
        throw new UserInputError('User not found');
      }

      if (user.backgroundPicture) {
        const deleteResult = await deleteFile(user.backgroundPicture);
        if (!deleteResult.success) {
          console.warn(`Failed to delete file: ${deleteResult.message}`);
        }
      }

      if (file) {
        try {
          const result = await uploadFile(file);
          user.backgroundPicture = result.url;
        } catch (err) {
          throw new Error('Error uploading file');
        }
      } else {
        user.backgroundPicture = undefined;
      }

      await user.save();
      return user;
    },

    editPost: async (_, { id, body, file }, context) => {
      if (!context.user) {
        throw new AuthenticationError('You must be logged in to edit a post');
      }

      if (body.length < 1 && !file) {
        throw new UserInputError('Comment must have a body or an image');
      }

      const user = await User.findById(context.user.id);
      if (!user) {
        throw new UserInputError('User not found');
      }

      const post = await Post.findById(id);
      if (!post) {
        throw new UserInputError('Post not found');
      }

      if (!post.author.equals(user.id)) {
        throw new AuthenticationError('You are not authorized to edit this post');
      }

      if (body.length > 281) {
        throw new UserInputError('Post body exceeds 281 characters');
      }

      let imageUrl: string | undefined = undefined;

      if (!file && post.imageUrl) {
        imageUrl = post.imageUrl;
      }

      if (file) {
        try {
          const result = await uploadFile(file);
          imageUrl = result.url;
        } catch (err) {
          throw new Error('Error uploading file');
        }
      }

      const hashTags = body ? extractHashtags(body) : undefined;
      const mentionedUsers = body ? await extractMentions(body) : undefined;

      if (!post.originalBody) post.originalBody = post.body;
      if (post.originalBody === body) post.originalBody = undefined;

      post.body = body;
      post.imageUrl = imageUrl;
      post.hashTags = hashTags;

      if (
        mentionedUsers &&
        mentionedUsers.length > 0 &&
        post.mentionedUsers &&
        post.mentionedUsers.length > 0
      ) {
        mentionedUsers
          .filter((id) => !post.mentionedUsers?.includes(id))
          .forEach(async (id) => {
            const user = await User.findById(id);
            if (!user) return;
            user.mentionedPostIds.push(post.id);

            if (user.id !== post.author) {
              const notification = new Notification({
                type: 'MENTION',
                postType: 'post',
                postID: post.id,
                recipient: user,
                sender: post.author,
              });

              await notification.save();
            }

            return await user.save();
          });
        post.mentionedUsers
          .filter((id) => !mentionedUsers.includes(id))
          .forEach(async (id) => {
            const user = await User.findById(id);
            if (!user) return;
            user.mentionedPostIds = user.mentionedPostIds.filter((postId) => postId !== post.id);

            if (user.id !== post.author) {
              await Notification.findOneAndDelete({
                type: 'MENTION',
                postType: 'post',
                postID: post.id,
                recipient: user,
                sender: post.author,
              });
            }

            return await user.save();
          });
      }
      post.mentionedUsers = mentionedUsers;
      await post.save();

      return await post.populate('author');
    },

    editComment: async (_, { id, body, file }, context) => {
      if (!context.user) {
        throw new AuthenticationError('You must be logged in to edit a comment');
      }

      if (body.length < 1 && !file) {
        throw new UserInputError('Comment must have a body or an image');
      }

      const user = await User.findById(context.user.id);
      if (!user) {
        throw new UserInputError('User not found');
      }

      const comment = await Comment.findById(id);
      if (!comment) {
        throw new UserInputError('Comment not found');
      }

      if (!comment.author.equals(user.id)) {
        throw new AuthenticationError('You are not authorized to edit this comment');
      }

      if (body.length > 281) {
        throw new UserInputError('Comment body exceeds 281 characters');
      }

      let imageUrl: string | undefined = undefined;

      if (!file && comment.imageUrl) {
        imageUrl = comment.imageUrl;
      }

      if (file) {
        try {
          const result = await uploadFile(file);
          imageUrl = result.url;
        } catch (err) {
          throw new Error('Error uploading file');
        }
      }

      const hashTags = body ? extractHashtags(body) : undefined;
      const mentionedUsers = body ? await extractMentions(body) : undefined;

      if (!comment.originalBody) comment.originalBody = comment.body;
      if (comment.originalBody === body) comment.originalBody = undefined;

      comment.body = body;
      comment.imageUrl = imageUrl;
      comment.hashTags = hashTags;

      if (
        mentionedUsers &&
        mentionedUsers.length > 0 &&
        comment.mentionedUsers &&
        comment.mentionedUsers.length > 0
      ) {
        mentionedUsers
          .filter((id) => !comment.mentionedUsers?.includes(id))
          .forEach(async (id) => {
            const user = await User.findById(id);
            if (!user) return;
            user.mentionedCommentIds.push(comment.id);

            if (user.id !== comment.author) {
              const notification = new Notification({
                type: 'MENTION',
                postType: 'reply',
                postID: comment.id,
                recipient: user,
                sender: comment.author,
              });

              await notification.save();
            }

            return await user.save();
          });
        comment.mentionedUsers
          .filter((id) => !mentionedUsers.includes(id))
          .forEach(async (id) => {
            const user = await User.findById(id);
            if (!user) return;
            user.mentionedCommentIds = user.mentionedCommentIds.filter((postId) => postId !== comment.id);

            if (user.id !== comment.author) {
              await Notification.findOneAndDelete({
                type: 'MENTION',
                postType: 'reply',
                postID: comment.id,
                recipient: user,
                sender: comment.author,
              });
            }

            return await user.save();
          });
      }
      comment.mentionedUsers = mentionedUsers;

      await comment.save();

      return await comment.populate('author');
    },

    register: async (_, { username, password }) => {
      const existingUser = await User.findOne({ username });

      if (existingUser) {
        throw new Error('Username already exists');
      }

      if (username.length < 3 || password.length < 6) {
        throw new Error('Username must be at least 3 characters and password must be at least 6 characters');
      }

      if (username.length > 20 || password.length > 20) {
        throw new Error('Username and password must be at most 20 characters');
      }

      const usernameRegex = /^[a-zA-Z0-9_æøåÆØÅ]+$/;
      if (!usernameRegex.test(username)) {
        throw new Error('Username can only contain letters, numbers, and underscores.');
      }

      const user = new User({ username, password });
      await user.save();
      const token = signToken(user);
      return token;
    },

    login: async (_, { username, password }) => {
      const user = await User.findOne({ username });
      if (!user) {
        throw new Error('Invalid credentials');
      }
      const valid = await user.comparePassword(password);
      if (!valid) {
        throw new Error('Invalid credentials');
      }
      const token = signToken(user);
      return token;
    },

    deleteUser: async (_, { username }, context) => {
      if (!context.user) {
        throw new AuthenticationError('You must be logged in to delete a user');
      }

      const user = await User.findById(context.user.id);
      if (!user) {
        throw new UserInputError('User not found');
      }

      if ((user.username !== username && user.username !== 'admin') || username === 'admin') {
        throw new AuthenticationError('You are not authorized to delete this user');
      }

      try {
        const deletedUser = await User.findOneAndDelete({ username });
        if (!deletedUser) {
          throw new Error('User not found');
        }

        const userPosts = await Post.find({ author: deletedUser.id });
        const userComments = await Comment.find({ author: deletedUser.id });
        const userReposts = await Repost.find({ author: deletedUser.id });

        for (const post of userPosts) {
          if (post.imageUrl) {
            const deleteResult = await deleteFile(post.imageUrl);
            if (!deleteResult.success) {
              console.warn(`Failed to delete file: ${deleteResult.message}`);
            }
          }

          if (post.mentionedUsers) {
            post.mentionedUsers.forEach(
              async (id) => await User.findByIdAndUpdate(id, { $pull: { mentionedPostIds: post.id } })
            );
          }

          if (post.amtLikes > 0) {
            await User.updateMany({ $pull: { likedPostIds: post.id } });
          }

          if (post.amtReposts > 0) {
            await User.updateMany({ $pull: { repostedPostIds: post.id } });
            await Repost.deleteMany({ originalID: post.id });
          }
        }

        for (const comment of userComments) {
          if (comment.imageUrl) {
            const deleteResult = await deleteFile(comment.imageUrl);
            if (!deleteResult.success) {
              console.warn(`Failed to delete file: ${deleteResult.message}`);
            }
          }

          if (comment.mentionedUsers) {
            comment.mentionedUsers.forEach(
              async (id) => await User.findByIdAndUpdate(id, { $pull: { mentionedCommentIds: comment.id } })
            );
          }

          if (comment.parentType === 'post') {
            await Post.findByIdAndUpdate(comment.parentID, { $inc: { amtComments: -1 } });
          } else {
            await Comment.findByIdAndUpdate(comment.parentID, { $inc: { amtComments: -1 } });
          }

          if (comment.amtLikes > 0) {
            await User.updateMany({ $pull: { likedCommentIds: comment.id } });
          }
        }

        for (const repost of userReposts) {
          const originalPost = await Post.findById(repost.originalID);
          if (!originalPost) {
            throw new Error('Original post not found');
          }

          originalPost.amtReposts -= 1;
          await originalPost.save();

          await User.findByIdAndUpdate(repost.author, { $pull: { repostedPostIds: repost.originalID } });
        }

        await Post.deleteMany({ author: deletedUser.id });
        await Comment.deleteMany({ author: deletedUser.id });
        await Repost.deleteMany({ author: deletedUser.id });

        if (deletedUser.profilePicture) {
          const deleteResult = await deleteFile(deletedUser.profilePicture);
          if (!deleteResult.success) {
            console.warn(`Failed to delete file: ${deleteResult.message}`);
          }
        }

        if (deletedUser.backgroundPicture) {
          const deleteResult = await deleteFile(deletedUser.backgroundPicture);
          if (!deleteResult.success) {
            console.warn(`Failed to delete file: ${deleteResult.message}`);
          }
        }

        return deletedUser;
      } catch (err) {
        throw new Error(`Error deleting user: ${(err as Error).message}`);
      }
    },

    createComment: async (_, { body, parentID, parentType, file }, { user }) => {
      if (!user) {
        throw new AuthenticationError('You must be logged in to create a comment');
      }

      if (body.length < 1 && !file) {
        throw new UserInputError('Comment must have a body or an image');
      }

      if (!user) {
        throw new UserInputError('User not found');
      }

      if (body.length > 281) {
        throw new UserInputError('Comment body exceeds 281 characters');
      }

      let imageUrl = null;

      if (file) {
        try {
          const result = await uploadFile(file);
          imageUrl = result.url;
        } catch (err) {
          throw new Error('Error uploading file');
        }
      }
      const hashTags = body ? extractHashtags(body) : undefined;
      const mentionedUsers = body ? await extractMentions(body) : undefined;

      try {
        const newComment = new Comment({
          body,
          author: user.id,
          parentID,
          parentType,
          imageUrl,
          hashTags,
          mentionedUsers,
        });
        const savedComment = await newComment.save();

        let parent: PostType | CommentType | null = null;
        if (parentType === 'post') {
          parent = await Post.findByIdAndUpdate(parentID, { $inc: { amtComments: 1 } });
        } else {
          parent = await Comment.findByIdAndUpdate(parentID, { $inc: { amtComments: 1 } });
        }

        user.commentIds.push(savedComment.id);
        await user.save();

        if (mentionedUsers) {
          mentionedUsers.forEach(async (id) => {
            const user = await User.findById(id);
            if (!user) return;
            user.mentionedCommentIds.push(savedComment.id);

            if (user.id !== savedComment.author) {
              const notification = new Notification({
                type: 'MENTION',
                postType: 'reply',
                postID: savedComment.id,
                recipient: user,
                sender: savedComment.author,
              });

              await notification.save();
            }

            return await user.save();
          });
        }

        if (parent && user.id !== parent.author._id) {
          const notification = new Notification({
            type: 'COMMENT',
            postType: 'reply',
            postID: savedComment._id,
            recipient: parent.author,
            sender: user,
          });

          await notification.save();
        }

        return await savedComment.populate('author');
      } catch (err) {
        throw new Error('Error creating comment');
      }
    },

    deletePost: async (_, { id }, context) => {
      if (!context.user) {
        throw new AuthenticationError('You must be logged in to delete a post');
      }

      const user = await User.findById(context.user.id);

      if (!user) {
        throw new UserInputError('User not found');
      }

      if (!user.postIds.includes(id) && user.username !== 'admin') {
        throw new AuthenticationError('You are not authorized to delete this post');
      }

      try {
        const deletedPost = await Post.findByIdAndDelete(id);
        if (!deletedPost) {
          throw new Error('Post not found');
        }

        if (deletedPost.imageUrl) {
          const deleteResult = await deleteFile(deletedPost.imageUrl);
          if (!deleteResult.success) {
            console.warn(`Failed to delete file: ${deleteResult.message}`);
          }
        }

        if (deletedPost.amtReposts > 0) {
          await User.updateMany({ $pull: { repostedPostIds: deletedPost.id } });
          await Repost.deleteMany({ originalID: deletedPost.id });
        }

        user.postIds = user.postIds.filter((postId) => String(postId) !== String(deletedPost.id));

        deletedPost.mentionedUsers?.forEach(async (id) => {
          const user = await User.findById(id);

          if (!user) return;

          user.mentionedPostIds = user.mentionedPostIds.filter(
            (commentId) => String(commentId) !== String(deletedPost.id)
          );

          if (user.id !== deletedPost.author) {
            await Notification.findOneAndDelete({
              type: 'MENTION',
              postType: 'post',
              postID: deletedPost._id,
              sender: user,
            });
          }
          return;
        });

        await user.save();

        return deletedPost;
      } catch (err) {
        throw new Error(`Error deleting post: ${(err as Error).message}`);
      }
    },

    deleteComment: async (_, { id, parentID, parentType }, context) => {
      if (!context.user) {
        throw new AuthenticationError('You must be logged in to delete a comment');
      }

      const user = await User.findById(context.user.id);

      if (!user) {
        throw new UserInputError('User not found');
      }

      if (!user.commentIds.includes(id) && user.username !== 'admin') {
        throw new AuthenticationError('You are not authorized to delete this comment');
      }

      try {
        const deletedComment = await Comment.findByIdAndDelete(id);
        if (!deletedComment) {
          throw new Error('Comment not found');
        }

        if (deletedComment.imageUrl) {
          const deleteResult = await deleteFile(deletedComment.imageUrl);
          if (!deleteResult.success) {
            console.warn(`Failed to delete file: ${deleteResult.message}`);
          }
        }

        let parent: PostType | CommentType | null = null;
        if (parentType === 'post') {
          parent = await Post.findByIdAndUpdate(parentID, { $inc: { amtComments: -1 } });
        } else {
          parent = await Comment.findByIdAndUpdate(parentID, { $inc: { amtComments: -1 } });
        }

        user.commentIds = user.commentIds.filter(
          (commentId) => String(commentId) !== String(deletedComment.id)
        );

        deletedComment.mentionedUsers?.forEach(async (id) => {
          const user = await User.findById(id);

          if (!user) return;

          user.mentionedCommentIds = user.mentionedCommentIds.filter(
            (commentId) => String(commentId) !== String(deletedComment.id)
          );

          if (user.id !== deletedComment.author) {
            await Notification.findOneAndDelete({
              type: 'MENTION',
              postType: 'reply',
              postID: deletedComment._id,
              sender: user,
            });
          }
          return;
        });

        await user.save();

        if (parent && parent.author._id !== user.id) {
          await Notification.findOneAndDelete({
            type: 'COMMENT',
            postType: 'reply',
            postID: deletedComment._id,
            sender: user,
          });
        }

        return deletedComment;
      } catch (err) {
        throw new Error(`Error deleting comment: ${(err as Error).message}`);
      }
    },

    likePost: async (_, { postID }, context) => {
      if (!context.user) {
        throw new AuthenticationError('You must be logged in to like a post');
      }

      const post = await Post.findById(postID);
      if (!post) {
        throw new UserInputError('Post not found');
      }

      const user = await User.findById(context.user.id);
      if (!user) {
        throw new UserInputError('User not found');
      }

      if (!user.likedPostIds.includes(postID)) {
        post.amtLikes += 1;
        user.likedPostIds.push(postID);
        await post.save();
        await user.save();
      }

      if (post.author._id !== user.id) {
        const notification = new Notification({
          type: 'LIKE',
          postType: 'post',
          postID,
          recipient: post.author,
          sender: user,
        });

        await notification.save();
      }

      return await post.populate('author');
    },

    unlikePost: async (_, { postID }, context) => {
      if (!context.user) {
        throw new AuthenticationError('You must be logged in to unlike a post');
      }

      const post = await Post.findById(postID);
      if (!post) {
        throw new UserInputError('Post not found');
      }

      const user = await User.findById(context.user.id);
      if (!user) {
        throw new UserInputError('User not found');
      }

      const likedIndex = user.likedPostIds.indexOf(postID);
      if (likedIndex > -1) {
        post.amtLikes = Math.max(post.amtLikes - 1, 0);
        user.likedPostIds.splice(likedIndex, 1);
        await post.save();
        await user.save();
      }

      if (post.author._id !== user.id) {
        await Notification.findOneAndDelete({
          type: 'LIKE',
          postType: 'post',
          postID,
          sender: user,
        });
      }

      return await post.populate('author');
    },

    likeComment: async (_, { id }, context) => {
      if (!context.user) {
        throw new AuthenticationError('You must be logged in to like a comment');
      }

      const comment = await Comment.findById(id);
      if (!comment) {
        throw new UserInputError('Comment not found');
      }

      const user = await User.findById(context.user.id);
      if (!user) {
        throw new UserInputError('User not found');
      }

      if (!user.likedCommentIds.includes(id)) {
        comment.amtLikes += 1;
        user.likedCommentIds.push(id);
        await comment.save();
        await user.save();
      }

      if (comment.author._id !== user.id) {
        const notification = new Notification({
          type: 'LIKE',
          postType: 'reply',
          postID: id,
          recipient: comment.author,
          sender: user,
        });

        await notification.save();
      }

      return await comment.populate('author');
    },

    unlikeComment: async (_, { id }, context) => {
      if (!context.user) {
        throw new AuthenticationError('You must be logged in to unlike a comment');
      }

      const comment = await Comment.findById(id);
      if (!comment) {
        throw new UserInputError('Comment not found');
      }

      const user = await User.findById(context.user.id);
      if (!user) {
        throw new UserInputError('User not found');
      }

      const likedIndex = user.likedCommentIds.indexOf(id);
      if (likedIndex > -1) {
        comment.amtLikes = Math.max(comment.amtLikes - 1, 0);
        user.likedCommentIds.splice(likedIndex, 1);
        await comment.save();
        await user.save();
      }

      if (comment.author._id !== user.id) {
        await Notification.findOneAndDelete({
          type: 'LIKE',
          postType: 'reply',
          postID: id,
          sender: user,
        });
      }

      return await comment.populate('author');
    },

    followUser: async (_, { username }, context) => {
      if (!context.user) {
        throw new AuthenticationError('You must be logged in to follow a user');
      }
      const personToFollow = await User.findOne({ username });
      const user = await User.findById(context.user.id);
      if (!personToFollow || !user) {
        throw new UserInputError('User not found');
      }
      if (user.username === username) {
        throw new UserInputError('You cannot follow yourself');
      }

      if (user.following.includes(personToFollow.id)) {
        throw new UserInputError('You are already following this user');
      }

      personToFollow.followers.push(user.id);
      user.following.push(personToFollow.id);

      await personToFollow.save();
      await user.save();

      const notification = new Notification({
        type: 'FOLLOW',
        recipient: personToFollow,
        sender: user,
      });

      await notification.save();

      return personToFollow;
    },

    unfollowUser: async (_, { username }, context) => {
      if (!context.user) {
        throw new AuthenticationError('You must be logged in to unfollow a user');
      }

      if (context.user.username === username) {
        throw new UserInputError('You cannot unfollow yourself');
      }

      const personToUnfollow = await User.findOne({ username });
      const user = await User.findById(context.user.id);

      if (!personToUnfollow || !user) {
        throw new UserInputError('User not found');
      }

      if (!user.following.includes(personToUnfollow.id)) {
        throw new UserInputError('You are not following this user');
      }

      user.following = user.following.filter((id) => !id.equals(personToUnfollow.id));

      personToUnfollow.followers = personToUnfollow.followers.filter((id) => !id.equals(user.id));

      await personToUnfollow.save();
      await user.save();

      await Notification.findOneAndDelete({
        type: 'FOLLOW',
        recipient: personToUnfollow,
        sender: user,
      });

      return personToUnfollow;
    },
    deleteNotification: async (_, { id }, context) => {
      if (!context.user) {
        throw new AuthenticationError('You must be logged in to delete a notification');
      }

      const notification = await Notification.findById(id);
      if (!notification) {
        throw new UserInputError('Notification not found');
      }

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

  Parent: {
    __resolveType(parent: { body?: string; author?: Types.ObjectId; parentID?: string }) {
      if (parent.body && parent.author) {
        if (parent.parentID) {
          return 'Comment';
        }
        return 'Post';
      }
      return null;
    },
  },

  User: {
    followers: async (parent) => {
      return await User.find({ _id: { $in: parent.followers } });
    },
    following: async (parent) => {
      return await User.find({ _id: { $in: parent.following } });
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

  Post: {
    hashTags: (parent) => parent.hashTags,
    mentionedUsers: (parent) => parent.mentionedUsers,
    author: async (parent) => {
      return await User.findById(parent.author);
    },
  },

  Comment: {
    hashTags: (parent) => parent.hashTags,
    mentionedUsers: (parent) => parent.mentionedUsers,
    author: async (parent) => {
      return await User.findById(parent.author);
    },
  },
};

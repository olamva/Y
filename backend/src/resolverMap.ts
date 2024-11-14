import { IResolvers } from '@graphql-tools/utils';
import { AuthenticationError, UserInputError } from 'apollo-server-errors';
import { GraphQLUpload } from 'graphql-upload-minimal';
import { Types } from 'mongoose';
import { signToken } from './auth';
import { Comment, CommentType } from './models/comment';
import { Post, PostType } from './models/post';
import { User } from './models/user';
import { deleteFile, uploadFile } from './uploadFile';
import { extractHashtags } from './utils';
import { TrendingHashtagType } from './models/hashtag';

export const resolvers: IResolvers = {
  Upload: GraphQLUpload,

  Query: {
    getPosts: async (_, { page }) => {
      const POSTS_PER_PAGE = 10;
      const skip = (page - 1) * POSTS_PER_PAGE;

      try {
        return await Post.find().sort({ createdAt: -1 }).skip(skip).limit(POSTS_PER_PAGE).populate('author');
      } catch (err) {
        throw new Error('Error fetching posts');
      }
    },
    getUsers: async (_, { page }) => {
      const USERS_PER_PAGE = 16;
      const skip = (page - 1) * USERS_PER_PAGE;

      try {
        return await User.find({ username: { $nin: ['admin', 'fredrik'] } })
          .sort({ createdAt: -1 })
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
    getUser: async (_, { username }) => {
      try {
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
    getPostsByIds: async (_, { ids }) => {
      try {
        return await Post.find({ _id: { $in: ids } })
          .sort({ createdAt: -1 })
          .populate('author');
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

    getCommentsByIds: async (_, { ids }) => {
      try {
        return await Comment.find({ _id: { $in: ids } })
          .sort({ createdAt: -1 })
          .populate('author');
      } catch (err) {
        throw new Error('Error fetching comments by IDs');
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

    searchUsers: async (_, { query }) => {
      if (query.length > 40) {
        throw new UserInputError('Query can max be 40 characters');
      }

      try {
        return await User.find({
          username: { $regex: query, $options: 'i' },
        }).sort({ createdAt: -1 });
      } catch (err) {
        throw new Error('Error performing user search');
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
    getTrendingHashtags: async (_, { limit }, context) => {
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

        const sortedHashtags: TrendingHashtagType[] = Array.from(hashtagMap, ([tag, count]) => ({
          tag,
          count,
        })).sort((a, b) => b.count - a.count);

        return sortedHashtags.slice(0, limit);
      } catch (error) {
        console.error('Error fetching trending hashtags:', error);
        throw new Error('Failed to fetch trending hashtags');
      }
    },

    getPostsByHashtag: async (_, { hashtag, page }, context) => {
      const PAGE_SIZE = 10;

      try {
        if (!hashtag || typeof hashtag !== 'string') {
          throw new UserInputError('Invalid hashtag provided');
        }

        const normalizedHashtag = hashtag.toLowerCase();

        const skip = (page - 1) * PAGE_SIZE;
        const limit = PAGE_SIZE;

        const posts = await Post.find({ hashTags: normalizedHashtag })
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .populate('author');

        return posts;
      } catch (error) {
        console.error(`Error fetching posts for hashtag "${hashtag}":`, error);
        throw new Error('Failed to fetch posts by hashtag');
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

      const hashTags = body ? extractHashtags(body) : undefined;

      try {
        const newPost = new Post({ body, author: user.id, imageUrl, hashTags });
        const savedPost = await newPost.save();

        user.postIds.push(savedPost.id);
        await user.save();

        return await savedPost.populate('author');
      } catch (err) {
        throw new Error('Error creating post');
      }
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

      if (!post.originalBody) post.originalBody = post.body;
      if (post.originalBody === body) post.originalBody = undefined;

      post.body = body;
      post.imageUrl = imageUrl;
      post.hashTags = hashTags;
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

      if (!comment.originalBody) comment.originalBody = comment.body;
      if (comment.originalBody === body) comment.originalBody = undefined;

      comment.body = body;
      comment.imageUrl = imageUrl;
      comment.hashTags = hashTags;
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

      const usernameRegex = /^[a-zA-Z0-9_]+$/;
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

    createComment: async (_, { body, parentID, parentType, file }, context) => {
      if (!context.user) {
        throw new AuthenticationError('You must be logged in to create a comment');
      }

      if (body.length < 1 && !file) {
        throw new UserInputError('Comment must have a body or an image');
      }

      const user = await User.findById(context.user.id);

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

      try {
        const newComment = new Comment({
          body,
          author: user.id,
          parentID,
          parentType,
          imageUrl,
          hashTags,
        });
        const savedComment = await newComment.save();

        if (parentType === 'post') {
          await Post.findByIdAndUpdate(parentID, { $inc: { amtComments: 1 } });
        } else {
          await Comment.findByIdAndUpdate(parentID, { $inc: { amtComments: 1 } });
        }

        user.commentIds.push(savedComment.id);
        await user.save();

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

        user.postIds = user.postIds.filter((postId) => String(postId) !== String(deletedPost.id));
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

        if (parentType === 'post') {
          await Post.findByIdAndUpdate(parentID, { $inc: { amtComments: -1 } });
        } else {
          await Comment.findByIdAndUpdate(parentID, { $inc: { amtComments: -1 } });
        }

        user.commentIds = user.commentIds.filter(
          (commentId) => String(commentId) !== String(deletedComment.id)
        );
        await user.save();

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

      return personToUnfollow;
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

  Post: {
    hashTags: (parent) => parent.hashTags,
    author: async (parent) => {
      return await User.findById(parent.author);
    },
  },

  Comment: {
    hashTags: (parent) => parent.hashTags,
    author: async (parent) => {
      return await User.findById(parent.author);
    },
  },
};

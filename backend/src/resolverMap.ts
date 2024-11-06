import { IResolvers } from '@graphql-tools/utils';
import { AuthenticationError, UserInputError } from 'apollo-server-errors';
import { signToken } from './auth';
import { Comment } from './models/comment';
import { Post } from './models/post';
import { User } from './models/user';
import { uploadFile } from './uploadFile';
import { GraphQLUpload } from 'graphql-upload-minimal';

export const resolvers: IResolvers = {
  Upload: GraphQLUpload,
  Query: {
    getPosts: async (_, { page }) => {
      const POSTS_PER_PAGE = 10;
      const skip = (page - 1) * POSTS_PER_PAGE;

      try {
        return await Post.find().sort({ createdAt: -1 }).skip(skip).limit(POSTS_PER_PAGE);
      } catch (err) {
        throw new Error('Error fetching posts');
      }
    },
    getUsers: async (_, { page }) => {
      const USERS_PER_PAGE = 10;
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
        return await Post.findById(id);
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
    getComments: async (_, { postID }) => {
      try {
        return await Comment.find({ parentID: postID }).sort({ createdAt: -1 });
      } catch (err) {
        throw new Error('Error fetching comments');
      }
    },
    getPostsByIds: async (_, { ids }) => {
      try {
        return await Post.find({ _id: { $in: ids } }).sort({ createdAt: -1 });
      } catch (err) {
        throw new Error('Error fetching posts by IDs');
      }
    },

    getCommentsByIds: async (_, { ids }) => {
      try {
        return await Comment.find({ _id: { $in: ids } }).sort({ createdAt: -1 });
      } catch (err) {
        throw new Error('Error fetching comments by IDs');
      }
    },

    async searchAll(_: any, { query }: { query: string }) {
      if (query.length > 40) {
        throw new UserInputError('Query can max be 40 characters');
      }

      try {
        const posts = await Post.find({
          $or: [{ body: { $regex: query, $options: 'i' } }, { author: { $regex: query, $options: 'i' } }],
        });

        const users = await User.find({
          username: { $regex: query, $options: 'i' },
        });

        return [...users, ...posts];
      } catch (err) {
        throw new Error('Error performing search');
      }
    },

    async searchUsers(_: any, { query }: { query: string }) {
      if (query.length > 40) {
        throw new UserInputError('Query can max be 40 characters');
      }

      return await User.find({
        username: { $regex: query, $options: 'i' },
      });
    },
  },

  Mutation: {
    createPost: async (_, { body, file }, context) => {
      if (!context.user) {
        throw new AuthenticationError('You must be logged in to create a post');
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

      try {
        const newPost = new Post({ body, author: user.username, imageUrl });
        const savedPost = await newPost.save();

        user.postIds.push(savedPost.id);
        await user.save();

        return savedPost;
      } catch (err) {
        throw new Error('Error creating post');
      }
    },

    editPost: async (_, { id, body }, context) => {
      if (!context.user) {
        throw new AuthenticationError('You must be logged in to edit a post');
      }

      const user = await User.findById(context.user.id);
      if (!user) {
        throw new UserInputError('User not found');
      }

      const post = await Post.findById(id);
      if (!post) {
        throw new UserInputError('Post not found');
      }

      if (post.author !== user.username) {
        throw new AuthenticationError('You are not authorized to edit this post');
      }

      if (body.length > 281) {
        throw new UserInputError('Post body exceeds 281 characters');
      }
      if (!post.originalBody) post.originalBody = post.body;
      if (post.originalBody === body) post.originalBody = undefined;

      post.body = body;
      await post.save();

      return post;
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

    createComment: async (_, { body, parentID }, context) => {
      if (!context.user) {
        throw new AuthenticationError('You must be logged in to create a comment');
      }

      const user = await User.findById(context.user.id);

      if (!user) {
        throw new UserInputError('User not found');
      }

      if (body.length > 281) {
        throw new UserInputError('Post body exceeds 281 characters');
      }

      try {
        const newComment = new Comment({ body, author: user.username, parentID: parentID });
        const savedComment = await newComment.save();
        await Post.findByIdAndUpdate(parentID, { $inc: { amtComments: 1 } });

        user.commentIds.push(savedComment.id);
        await user.save();

        return savedComment;
      } catch (err) {
        throw new Error('Error creating comment');
      }
    },
    deletePost: async (_, { id }, context) => {
      if (!context.user) {
        throw new AuthenticationError('You must be logged in to create a comment');
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
        await Comment.deleteMany({ parentID: id });

        return deletedPost;
      } catch (err) {
        throw new Error(`Error deleting post and its comments: ${(err as Error).message}`);
      }
    },
    deleteComment: async (_, { id }, context) => {
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
        await Post.findByIdAndUpdate(deletedComment.parentID, { $inc: { amtComments: -1 } });

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

      return post;
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

      return post;
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
      if (context.user.username === username) {
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

      user.following = user.following.filter((id) => String(id) !== String(personToUnfollow.id));

      personToUnfollow.followers = personToUnfollow.followers.filter((id) => String(id) !== String(user.id));

      await personToUnfollow.save();
      await user.save();

      return personToUnfollow;
    },
  },
  SearchResult: {
    __resolveType(obj: any) {
      if (obj.username) {
        return 'User';
      }
      if (obj.body) {
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
};

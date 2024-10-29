import { IResolvers } from 'graphql-tools';
import { Post } from './models/post';
import { User } from './models/user';
import { Comment } from './models/comment';

export const resolvers: IResolvers = {
  Query: {
    getPosts: async () => {
      try {
        return await Post.find();
      } catch (err) {
        throw new Error('Error fetching posts');
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
        return await Comment.find({ parentId: postID });
      } catch (err) {
        throw new Error('Error fetching comments');
      }
    },
    async searchPosts(_: any, { query }: { query: string }) {
      return await Post.find({
        $or: [{ body: { $regex: query, $options: 'i' } }, { author: { $regex: query, $options: 'i' } }],
      });
    },
    async searchUsers(_: any, { query }: { query: string }) {
      return await User.find({
        username: { $regex: query, $options: 'i' },
      });
    },
  },

  Mutation: {
    createPost: async (_, { body, author }) => {
      try {
        const newPost = new Post({ body, author });
        return await newPost.save();
      } catch (err) {
        throw new Error('Error creating post');
      }
    },
    createUser: async (_, { username }) => {
      try {
        const newUser = new User({ username });
        return await newUser.save();
      } catch (err) {
        throw new Error('Error creating user');
      }
    },
    createComment: async (_, { body, author, parentID }) => {
      try {
        const newComment = new Comment({ body, author, parentID: parentID });
        return await newComment.save();
      } catch (err) {
        throw new Error('Error creating comment');
      }
    },
  },
};

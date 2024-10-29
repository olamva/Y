import { IResolvers } from 'graphql-tools';
import { Post } from './models/post';
import { User } from './models/user';

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
        return await User.findOne({ username });
      } catch (err) {
        throw new Error('Error fetching user');
      }
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
  },
};

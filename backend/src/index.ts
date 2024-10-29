import express, { Request } from 'express';
import { ApolloServer } from 'apollo-server-express';
import { typeDefs } from './schema';
import { resolvers } from './resolverMap';
import mongoose from 'mongoose';
import 'dotenv/config';
import compression from 'compression';
import cors from 'cors';
import { User, UserType } from './models/user';
import { verifyToken } from './auth';

interface Context {
  user?: UserType;
}

async function startServer() {
  const app = express();

  app.use('*', cors());
  app.use(compression());

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: async ({ req }: { req: Request }): Promise<Context> => {
      const authHeader = req.headers.authorization || '';
      const token = authHeader.replace('Bearer ', '');
      if (token) {
        const decoded = verifyToken(token);
        if (decoded && typeof decoded === 'object') {
          const user = await User.findById((decoded as any).id);
          if (user) {
            return { user };
          }
        }
      }
      return {};
    },
  });

  await server.start();
  server.applyMiddleware({ app });

  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI environment variable is not defined');
  }

  mongoose
    .connect(MONGODB_URI)
    .then(() => {
      console.log('Connected to MongoDB');
      app.listen({ port: 3001 }, () =>
        console.log(`Server ready at http://localhost:3001${server.graphqlPath}`)
      );
    })
    .catch((err) => {
      console.error('Error connecting to MongoDB:', err);
    });
}

startServer();

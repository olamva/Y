import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { typeDefs } from './schema';
import { resolvers } from './resolverMap';
import mongoose from 'mongoose';
import 'dotenv/config';
import compression from 'compression';
import cors from 'cors';

async function startServer() {
  const app = express();

  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });

  app.use('*', cors());
  app.use(compression());

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

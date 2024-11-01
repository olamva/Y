import express, { Request } from 'express';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { json } from 'body-parser';
import mongoose from 'mongoose';
import 'dotenv/config';
import compression from 'compression';
import cors from 'cors';
import { User, UserType } from './models/user';
import { verifyToken } from './auth';
import { createSchema } from './schema';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import http from 'http';

interface Context {
  user?: UserType;
}

async function startServer() {
  const app = express();
  const httpServer = http.createServer(app);

  app.use(cors());
  app.use(compression());

  const schema = await createSchema();

  const server = new ApolloServer<Context>({
    schema,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  });

  await server.start();

  app.use(
    '/graphql',
    cors<cors.CorsRequest>(),
    json(),
    expressMiddleware(server, {
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
    })
  );

  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI environment variable is not defined');
  }

  mongoose
    .connect(MONGODB_URI)
    .then(() => {
      console.log('Connected to MongoDB');
      httpServer.listen({ port: 3001 }, () =>
        console.log(`🚀 Server ready at http://localhost:3001/graphql`)
      );
    })
    .catch((err) => {
      console.error('Error connecting to MongoDB:', err);
    });
}

startServer().catch((error) => {
  console.error('Server failed to start', error);
});

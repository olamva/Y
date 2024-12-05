import { GraphQLFileLoader } from '@graphql-tools/graphql-file-loader';
import { loadSchema } from '@graphql-tools/load';
import { mergeResolvers } from '@graphql-tools/merge';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { GraphQLSchema } from 'graphql';
import path from 'path';
import { commentMutations, commentQueries, commentTypeResolvers } from './resolvers/comment';
import { hashtagQueries } from './resolvers/hashtags';
import {
  notificationMutations,
  notificationQueries,
  notificationTypeResolvers,
} from './resolvers/notifications';
import { postMutations, postQueries, postTypeResolvers } from './resolvers/post';
import { repostMutations, repostQueries, repostTypeResolvers } from './resolvers/repost';
import { userMutations, userQueries, userTypeResolvers } from './resolvers/user';

export async function createSchema(): Promise<GraphQLSchema> {
  const schemaPath = path.join(__dirname, 'schema', 'schema.graphql');
  const resolvers = mergeResolvers([
    commentMutations,
    commentQueries,
    commentTypeResolvers,
    hashtagQueries,
    notificationMutations,
    notificationQueries,
    notificationTypeResolvers,
    postMutations,
    postQueries,
    postTypeResolvers,
    repostMutations,
    repostQueries,
    repostTypeResolvers,
    userMutations,
    userQueries,
    userTypeResolvers,
  ]);

  const typeDefs = await loadSchema(schemaPath, {
    loaders: [new GraphQLFileLoader()],
  });
  const schema: GraphQLSchema = makeExecutableSchema({
    typeDefs,
    resolvers,
  });

  return schema;
}

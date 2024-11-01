import path from 'path';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { loadSchema } from '@graphql-tools/load';
import { GraphQLFileLoader } from '@graphql-tools/graphql-file-loader';
import { GraphQLSchema } from 'graphql';
import { resolvers } from './resolverMap';

export async function createSchema(): Promise<GraphQLSchema> {
  const schemaPath = path.join(__dirname, 'schema', 'schema.graphql');

  const typeDefs = await loadSchema(schemaPath, {
    loaders: [new GraphQLFileLoader()],
  });
  const schema: GraphQLSchema = makeExecutableSchema({
    typeDefs,
    resolvers,
  });

  return schema;
}

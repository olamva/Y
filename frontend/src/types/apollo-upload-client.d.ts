declare module "apollo-upload-client" {
  import { ApolloLink } from "@apollo/client/link/core";

  export interface CreateUploadLinkOptions {
    uri?: string;
    credentials?: string;
    headers?: Record<string, string>;
    fetch?: typeof fetch;
    fetchOptions?: Record<string, unknown>;
  }

  export function createUploadLink(
    options?: CreateUploadLinkOptions,
  ): ApolloLink;
}

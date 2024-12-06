# Backend for Y <!-- omit from toc -->

An Appollo Express backend, with MongoDB as database

## Table of Contents

- [Table of Contents](#table-of-contents)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Configure Environment Variables](#configure-environment-variables)
  - [Running the server](#running-the-server)
- [graphql-api](#graphql-api)
  - [Queries](#queries)
    - [`getPosts(page: Int!, filter: PostFilter!, limit: Int!): [PostItem!]!`](#getpostspage-int-filter-postfilter-limit-int-postitem)
    - [`getPost(id: ID!): Post`](#getpostid-id-post)
    - [`getRepostsByUser(username: String!, page: Int!, limit: Int!): [Repost!]!`](#getrepostsbyuserusername-string-page-int-limit-int-repost)
    - [`getComments(postID: ID!, page: Int!): [Comment!]!`](#getcommentspostid-id-page-int-comment)
    - [`getUser(username: String!): User`](#getuserusername-string-user)
    - [`getUsers(page: Int!, excludeFollowing: Boolean, filter: String): [User!]!`](#getuserspage-int-excludefollowing-boolean-filter-string-user)
    - [`searchPosts(query: String!, page: Int!): [Post!]!`](#searchpostsquery-string-page-int-post)
    - [`searchUsers(query: String!, page: Int!, limit: Int!): [User!]!`](#searchusersquery-string-page-int-limit-int-user)
    - [`searchHashtags(query: String!, page: Int!, limit: Int!): [TrendingHashtag!]!`](#searchhashtagsquery-string-page-int-limit-int-trendinghashtag)
    - [`getPostsByIds(ids: [ID!]!, page: Int!, limit: Int!): [Post!]!`](#getpostsbyidsids-id-page-int-limit-int-post)
    - [`getComment(id: ID!): Comment`](#getcommentid-id-comment)
    - [`getCommentsByIds(ids: [ID!]!, page: Int!): [Comment!]!`](#getcommentsbyidsids-id-page-int-comment)
    - [`getParent(parentID: ID!, parentType: String!): Parent`](#getparentparentid-id-parenttype-string-parent)
    - [`getParentsByIds(parents: [ParentInput!]!): [Parent!]!`](#getparentsbyidsparents-parentinput-parent)
    - [`getTrendingHashtags(page: Int!, limit: Int): [TrendingHashtag!]!`](#gettrendinghashtagspage-int-limit-int-trendinghashtag)
    - [`getContentByHashtag(hashtag: String!, page: Int!): [Parent!]!`](#getcontentbyhashtaghashtag-string-page-int-parent)
    - [`getNotifications(page: Int!, limit: Int!): [Notification!]!`](#getnotificationspage-int-limit-int-notification)
  - [Mutations](#mutations)
    - [`createPost(body: String, file: Upload): Post!`](#createpostbody-string-file-upload-post)
    - [`repost(id: ID!, type: String!): Repost!`](#repostid-id-type-string-repost)
    - [`unrepost(id: ID!): Repost!`](#unrepostid-id-repost)
    - [`editPost(id: ID!, body: String, file: Upload): Post!`](#editpostid-id-body-string-file-upload-post)
    - [`editComment(id: ID!, body: String, file: Upload): Comment!`](#editcommentid-id-body-string-file-upload-comment)
    - [`createComment(body: String, parentID: ID!, parentType: String!, file: Upload): Comment!`](#createcommentbody-string-parentid-id-parenttype-string-file-upload-comment)
    - [`likePost(id: ID!, type: String!): Post!`](#likepostid-id-type-string-post)
    - [`unlikePost(id: ID!, type: String!): Post!`](#unlikepostid-id-type-string-post)
    - [`followUser(username: String!): User!`](#followuserusername-string-user)
    - [`unfollowUser(username: String!): User!`](#unfollowuserusername-string-user)
- [Authentication](#authentication)

## Getting Started

### Prerequisites

Ensure you have the following installed on your machine:

- Node.js (v14 or higher)
- npm (comes with Node.js)
- Access to NTNU's network

### Installation

1. Clone the repository:
   ```bash
   git clone https://git.ntnu.no/IT2810-H24/T06-Project-2
   cd T06-Project-2/backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

### Configure Environment Variables

Create a `.env` file in the root directory and add the following variables:

```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
```

### Running the server

Start the development server with:

```bash
npm run start:dev
```

## graphql-api

### Queries

#### `getPosts(page: Int!, filter: PostFilter!, limit: Int!): [PostItem!]!`

Fetches a paginated list of posts or reposts based on the specified filter.

- **Parameters:**
  - `page` (Int!): The page number to retrieve.
  - `filter` (PostFilter!): The filter to apply (LATEST, FOLLOWING, POPULAR, CONTROVERSIAL).
  - `limit` (Int!): The number of items to retrieve per page.
- **Returns:** An array of `PostItem` (either `Post` or `Repost`).

---

#### `getPost(id: ID!): Post`

Retrieves a single post by its ID.

- **Parameters:**
  - `id` (ID!): The unique identifier of the post.
- **Returns:** A `Post` object.

---

#### `getRepostsByUser(username: String!, page: Int!, limit: Int!): [Repost!]!`

Fetches a paginated list of reposts made by a specific user.

- **Parameters:**
  - `username` (String!): The username of the user.
  - `page` (Int!): The page number to retrieve.
  - `limit` (Int!): The number of reposts to retrieve per page.
- **Returns:** An array of `Repost` objects.

---

#### `getComments(postID: ID!, page: Int!): [Comment!]!`

Fetches a paginated list of comments for a specific post.

- **Parameters:**
  - `postID` (ID!): The ID of the parent post.
  - `page` (Int!): The page number to retrieve.
- **Returns:** An array of `Comment` objects.

---

#### `getUser(username: String!): User`

Retrieves a user by their username.

- **Parameters:**
  - `username` (String!): The username of the user.
- **Returns:** A `User` object.

---

#### `getUsers(page: Int!, excludeFollowing: Boolean, filter: String): [User!]!`

Fetches a paginated list of users, with an option to exclude users the current user is following.

- **Parameters:**
  - `page` (Int!): The page number to retrieve.
  - `excludeFollowing` (Boolean): Whether to exclude followed users.
  - `filter` (String): Filter which users to fetch, either `ALL`, `VERIFIED`, or `DEVELOPERS`.
- **Returns:** An array of `User` objects.

---

#### `searchPosts(query: String!, page: Int!): [Post!]!`

Searches for posts matching the query.

- **Parameters:**
  - `query` (String!): The search term.
  - `page` (Int!): The page number to retrieve.
- **Returns:** An array of `Post` objects.

---

#### `searchUsers(query: String!, page: Int!, limit: Int!): [User!]!`

Searches for users matching the query.

- **Parameters:**
  - `query` (String!): The search term.
  - `page` (Int!): The page number to retrieve.
  - `limit` (Int!): The number of users to retrieve per page.
- **Returns:** An array of `User` objects.

---

#### `searchHashtags(query: String!, page: Int!, limit: Int!): [TrendingHashtag!]!`

Searches for trending hashtags matching the query.

- **Parameters:**
  - `query` (String!): The hashtag search term.
  - `page` (Int!): The page number to retrieve.
  - `limit` (Int!): The number of hashtags to retrieve per page.
- **Returns:** An array of `TrendingHashtag` objects.

---

#### `getPostsByIds(ids: [ID!]!, page: Int!, limit: Int!): [Post!]!`

Fetches multiple posts by their IDs with pagination.

- **Parameters:**
  - `ids` ([ID!]!): An array of post IDs.
  - `page` (Int!): The page number to retrieve.
  - `limit` (Int!): The number of posts to retrieve per page.
- **Returns:** An array of `Post` objects.

---

#### `getComment(id: ID!): Comment`

Retrieves a comment by its ID.

- **Parameters:**
  - `id` (ID!): A comment ID.
- **Returns:** A `Comment` object.

---

#### `getCommentsByIds(ids: [ID!]!, page: Int!): [Comment!]!`

Fetches multiple comments by their IDs with pagination.

- **Parameters:**
  - `ids` ([ID!]!): An array of comment IDs.
  - `page` (Int!): The page number to retrieve.
- **Returns:** An array of `Comment` objects.

---

#### `getParent(parentID: ID!, parentType: String!): Parent`

Retrieves the parent post or comment of a comment.

- **Parameters:**
  - `parentID` (ID!): The ID of the parent.
  - `parentType` (String!): The type of the parent ('Post' or 'Comment').
- **Returns:** A `Parent` (either `Post` or `Comment`).

---

#### `getParentsByIds(parents: [ParentInput!]!): [Parent!]!`

Fetches multiple parent posts or comments by their IDs.

- **Parameters:**
  - `parents` ([ParentInput!]!): An array of parent IDs and types.
- **Returns:** An array of `Parent` objects.

---

#### `getTrendingHashtags(page: Int!, limit: Int): [TrendingHashtag!]!`

Fetches a list of trending hashtags.

- **Parameters:**
  - `page` (Int!): The page number to retrieve.
  - `limit` (Int!): The number of hashtags to retrieve per page.
- **Returns:** An array of `TrendingHashtag` objects.

---

#### `getContentByHashtag(hashtag: String!, page: Int!): [Parent!]!`

Fetches posts and comments associated with a specific hashtag.

- **Parameters:**
  - `hashtag` (String!): The hashtag to filter content by.
  - `page` (Int!): The page number to retrieve.
- **Returns:** An array of `Parent` objects (either `Post` or `Comment`).

---

#### `getNotifications(page: Int!, limit: Int!): [Notification!]!`

Fetches a paginated list of notifications for the authenticated user.

- **Parameters:**
  - `page` (Int!): The page number to retrieve.
  - `limit` (Int!): The number of notifications to retrieve per page.
- **Returns:** An array of `Notification` objects.

---

### Mutations

#### `createPost(body: String, file: Upload): Post!`

Creates a new post with optional image upload.

- **Parameters:**
  - `body` (String): The content of the post.
  - `file` (Upload): The image file to attach (optional).
- **Requires Authentication:** Yes
- **Returns:** The created `Post` object.

---

#### `repost(id: ID!, type: String!): Repost!`

Reposts a post.

- **Parameters:**
  - `id` (ID!): The ID of the post to repost.
  - `type` (String!): The type of the post to repost ('Post' or 'Repost').
- **Requires Authentication:** Yes
- **Returns:** The created `Repost` object.

---

#### `unrepost(id: ID!): Repost!`

Removes a repost from the user's feed.

- **Parameters:**
  - `id` (ID!): The ID of the repost to remove.
- **Requires Authentication:** Yes
- **Returns:** The removed `Repost` object.

---

#### `editPost(id: ID!, body: String, file: Upload): Post!`

Edits an existing post.

- **Parameters:**
  - `id` (ID!): The ID of the post to edit.
  - `body` (String): The updated content of the post.
  - `file` (Upload): The updated image file (optional).
- **Requires Authentication:** Yes
- **Returns:** The updated `Post` object.

---

#### `editComment(id: ID!, body: String, file: Upload): Comment!`

Edits an existing comment.

- **Parameters:**
  - `id` (ID!): The ID of the comment to edit.
  - `body` (String): The updated content of the comment.
  - `file` (Upload): The updated image file (optional).
- **Requires Authentication:** Yes
- **Returns:** The updated `Comment` object.

---

#### `createComment(body: String, parentID: ID!, parentType: String!, file: Upload): Comment!`

Creates a new comment on a post or comment with optional image upload.

- **Parameters:**
  - `body` (String): The content of the comment.
  - `parentID` (ID!): The ID of the parent post or comment.
  - `parentType` (String!): The type of the parent ('Post' or 'Comment').
  - `file` (Upload): The image file to attach (optional).
- **Requires Authentication:** Yes
- **Returns:** The created `Comment` object.

---

#### `likePost(id: ID!, type: String!): Post!`

Likes a post.

- **Parameters:**
  - `id` (ID!): The ID of the post to like.
  - `type` (String!): The type of post ('Post' or 'Repost').
- **Requires Authentication:** Yes
- **Returns:** The updated `Post` object.

---

#### `unlikePost(id: ID!, type: String!): Post!`

Unlikes a post.

- **Parameters:**
  - `id` (ID!): The ID of the post to unlike.
  - `type` (String!): The type of post ('Post' or 'Repost').
- **Requires Authentication:** Yes
- **Returns:** The updated `Post` object.

---

#### `followUser(username: String!): User!`

Follows a user.

- **Parameters:**
  - `username` (String!): The username of the user to follow.
- **Requires Authentication:** Yes
- **Returns:** The updated `User` object.

---

#### `unfollowUser(username: String!): User!`

Unfollows a user.

- **Parameters:**
  - `username` (String!): The username of the user to unfollow.
- **Requires Authentication:** Yes
- **Returns:** The updated `User` object.

## Authentication

Authentication is handled using JSON Web Tokens (JWT). To perform mutations that require authentication (e.g., creating posts or comments), include the JWT token in the Authorization header:

```makefile
Authorization: Bearer YOUR_JWT_TOKEN

```

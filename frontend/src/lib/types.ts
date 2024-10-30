type ContentType = {
  id: string;
  body: string;
  author: string;
  amtLikes: number;
  amtComments: number;
  createdAt: Date;
};

export type PostType = ContentType & {
  __typename: "Post";
};

export type CommentType = ContentType & {
  __typename: "Comment";
  parentID: string;
};

export type UserType = {
  __typename: "User";
  id: string;
  username: string;
  postIds: string[];
  likedPostIds: string[];
  commentIds: string[];
};

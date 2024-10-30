export type PostType = {
  __typename: "Post";
  id: string;
  body: string;
  author: string;
  amtLikes: number;
  amtComments: number;
  createdAt: Date;
};

export type CommentType = PostType & {
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

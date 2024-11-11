type ContentType = {
  id: string;
  body: string;
  originalBody?: string;
  author: UserType;
  amtLikes: number;
  amtComments: number;
  imageUrl?: string;
  createdAt: string;
};

export type PostType = ContentType & {
  __typename: "Post";
};

export type CommentType = ContentType & {
  __typename: "Comment";
  parentID: string;
  parentType: "post" | "reply";
};

export type UserType = {
  __typename: "User";
  id: string;
  username: string;
  postIds: string[];
  likedPostIds: string[];
  likedCommentIds: string[];
  commentIds: string[];
  followers: UserType[];
  following: UserType[];
  profilePicture?: string;
  backgroundPicture?: string;
};

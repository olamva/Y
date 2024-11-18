type ContentType = {
  id: string;
  body?: string;
  originalBody?: string;
  author: UserType;
  amtLikes: number;
  amtComments: number;
  imageUrl?: string;
  createdAt: string;
};

export type HashtagType = {
  __typename: "Hashtag";
  tag: string;
  count: number;
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
  firstName?: string;
  lastName?: string;
  biography?: string;
  postIds: string[];
  likedPostIds: string[];
  mentionedPostIds: string[];
  commentIds: string[];
  likedCommentIds: string[];
  mentionedCommentIds: string[];
  followers: UserType[];
  following: UserType[];
  profilePicture?: string;
  backgroundPicture?: string;
};

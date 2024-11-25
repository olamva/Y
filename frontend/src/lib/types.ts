type ContentType = {
  id: string;
  body?: string;
  originalBody?: string;
  author: UserType;
  amtLikes: number;
  amtComments: number;
  amtReposts: number;
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

export type RepostType = ContentType & {
  __typename: "Repost";
  originalAuthor: UserType;
  originalID: string;
  originalType: "post" | "reply";
  parentID?: string;
  parentType?: "post" | "reply";
  repostedAt: string;
};

export type PostItem =
  | (PostType & { __typename: "Post" })
  | (RepostType & { __typename: "Repost" });

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
  repostedPostIds: string[];
  commentIds: string[];
  likedCommentIds: string[];
  mentionedCommentIds: string[];
  followers: UserType[];
  following: UserType[];
  profilePicture?: string;
  backgroundPicture?: string;
  verified: VerifiedTiers;
};

export enum VerifiedTiers {
  UNVERIFIED = "UNVERIFIED",
  VERIFIED = "VERIFIED",
  MADS = "MADS",
  DEVELOPER = "DEVELOPER",
}

export type NotificationType = {
  __typename: "Notification";
  id: string;
  type: "LIKE" | "COMMENT" | "REPOST" | "MENTION" | "FOLLOW" | "FOLLOWING_POST";
  recipient: UserType;
  sender: UserType;
  createdAt: string;
  postType?: "post" | "reply";
  postID?: string;
};

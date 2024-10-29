export type PostType = {
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
  username: string;
  postIds: string[];
  likedPostIds: string[];
  commentIds: string[];
};

export type PostType = {
  id: string;
  body: string;
  author: string;
  amtLikes: number;
  amtComments: number;
};

export type CommentType = PostType & {
  parentID: string;
  commentID: string;
};

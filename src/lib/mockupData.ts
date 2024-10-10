import { CommentType, PostType, UserType } from "./types";

export const mockData: PostType[] = [
  {
    id: "1",
    body: "jeg er veldig glad i tailwind",
    author: "John",
    amtComments: 3,
    amtLikes: 3,
  },
  {
    id: "2",
    body: "jeg hater alle",
    author: "Robert",
    amtComments: 3,
    amtLikes: 2,
  },
  {
    id: "3",
    body: "jeg heter Harold",
    author: "Harold",
    amtComments: 4,
    amtLikes: 3,
  },
];

export const commentsMock: CommentType[] = [
  {
    id: "1",
    body: "mock comment",
    author: "Robert",
    amtComments: 0,
    amtLikes: 1,
    parentID: "1",
  },
  {
    id: "2",
    body: "mock comment",
    author: "John",
    amtComments: 0,
    amtLikes: 1,
    parentID: "1",
  },
];

export const usersMock: UserType[] = [
  {
    username: "John",
    postIds: ["1"],
    likedPostIds: ["1", "2"],
    commentIds: ["2"],
  },
  {
    username: "Robert",
    postIds: ["2"],
    likedPostIds: ["1"],
    commentIds: ["1"],
  },
  {
    username: "Harold",
    postIds: ["3"],
    likedPostIds: ["1", "2"],
    commentIds: [],
  },
];

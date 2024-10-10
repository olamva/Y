import { CommentType, PostType, UserType } from "./types";

export const mockData: PostType[] = [
  {
    id: "1",
    body: "jeg er veldig glad i tailwind",
    author: "Ola",
    amtComments: 2,
    amtLikes: 1,
  },
  {
    id: "2",
    body: "jeg hater alle",
    author: "Jørgen",
    amtComments: 3,
    amtLikes: 2,
  },
  {
    id: "3",
    body: "jeg heter fredrik",
    author: "Fredrik",
    amtComments: 4,
    amtLikes: 3,
  },
];

export const commentsMock: CommentType[] = [
  {
    id: "1",
    body: "mock comment",
    author: "2",
    amtComments: 0,
    amtLikes: 1,
    parentID: "1",
  },
  {
    id: "2",
    body: "mock comment",
    author: "1",
    amtComments: 1,
    amtLikes: 1,
    parentID: "1",
  },
];

export const usersMock: UserType[] = [
  {
    username: "mock user1",
    postIds: ["1"],
    likedPostIds: ["1", "2"],
    commentIds: ["1", "2"],
  },
  {
    username: "mock user2",
    postIds: ["2"],
    likedPostIds: ["1"],
    commentIds: ["1", "2"],
  },
  {
    username: "mock user",
    postIds: ["3"],
    likedPostIds: ["1", "2"],
    commentIds: ["1", "2"],
  },
];

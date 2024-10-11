import { CommentType, PostType } from "./types";

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
    body: "Jeg heter Ola",
    author: "Ola WaterBottom",
    amtComments: 0,
    amtLikes: 1,
    parentID: "1",
  },
  {
    id: "2",
    body: "Pass på hva du skriver.",
    author: "Pelle Politi",
    amtComments: 1,
    amtLikes: 1,
    parentID: "1",
  },
];

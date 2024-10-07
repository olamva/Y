import { Post } from "./post.Interface";
import { Comment } from "./post.Interface";

export const mockData: Post[] = [
  {
    id: 1,
    body: "mock body1",
    user: "mock user1",
    likedBy: {
      users: ["mock user1", "mock user2"],
    },
  },
  {
    id: 2,
    body: "mock body2",
    user: "mock user2",
    likedBy: {
      users: ["mock user1"],
    },
  },
  {
    id: 3,
    body: "mock body3",
    user: "mock user",
    likedBy: {
      users: ["mock user1", "mock user2"],
    },
  },
];

export const commentsMock: Comment[] = [
  {
    id: 1,
    body: "mock comment",
    user: "mock user",
    likedBy: {
      users: ["mock user1", "mock user2"],
    },
    parentID: "1",
  },
  {
    id: 2,
    body: "mock comment",
    user: "mock user",
    likedBy: {
      users: ["mock user1", "mock user2"],
    },
    parentID: "1",
  },
];

export interface Post {
    id: number;
    body: string;
    user: string;
    likedBy?: {
      users: string[];
    };
  }

export interface Comment extends Post {
  parentID: string;
}
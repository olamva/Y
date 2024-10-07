export interface Post {
    id: number;
    body: string;
    user: string;
    liked?: {
      users: string[];
    };
  }

export interface Comment extends Post {
  parentID: string;
}
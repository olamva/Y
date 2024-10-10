import { useEffect, useState } from "react";
import { mockData, commentsMock, usersMock } from "../../lib/mockupData";
import { PostType, CommentType, UserType } from "../../lib/types";
import Post from "../Post";

export const Userpage = () => {
  const [user, setUser] = useState<UserType>();
  const [posts, setPosts] = useState<PostType[]>([]);
  const [likedPosts, setLikedPosts] = useState<PostType[]>([]);
  const [comments, setComments] = useState<CommentType[]>([]);

  useEffect(() => {
    const thisUser = usersMock[0];
    const thisUserPosts = mockData.filter((post) => thisUser.postIds.includes(post.id));
    const thisUserLikedPosts = mockData.filter((post) => thisUser.likedPostIds.includes(post.id));
    const thisUserComments = commentsMock.filter((comment) => thisUser.commentIds.includes(comment.id));
    setUser(thisUser);
    setPosts(thisUserPosts);
    setLikedPosts(thisUserLikedPosts);
    setComments(thisUserComments);
  });

  return (
    <div>
      <div>
        <h1>{user ? user.username : "No user identified"}</h1>
      </div>
      <div>
        {posts.map((post) => {
          return (
            <Post post={post}></Post>
          );
        })}
      </div>
    </div>
  );
};
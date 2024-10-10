import Avatar from "@/components/Avatar";
import { ArrowUturnLeftIcon } from "@heroicons/react/24/outline";
import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import Post from "../components/Post";
import { commentsMock, mockData, usersMock } from "../lib/mockupData";
import { CommentType, PostType, UserType } from "../lib/types";

const Profile = () => {
  const { username } = useParams<{ username: string }>();
  const [user, setUser] = useState<UserType>(
    usersMock.find((user) => user.username === username) ?? usersMock[0],
  );
  const [posts, setPosts] = useState<PostType[]>([]);
  const [likedPosts, setLikedPosts] = useState<PostType[]>([]);
  const [comments, setComments] = useState<CommentType[]>([]);

  useEffect(() => {
    setUser(
      usersMock.find((user) => user.username === username) ?? usersMock[0],
    );
  }, [username]);

  const prevUserRef = useRef<UserType>();
  useEffect(() => {
    if (prevUserRef.current === user) return;
    prevUserRef.current = user;
    setPosts(mockData.filter((post) => user.postIds.includes(post.id)));
    setLikedPosts(
      mockData.filter((post) => user.likedPostIds.includes(post.id)),
    );
    setComments(
      commentsMock.filter((comment) => user.commentIds.includes(comment.id)),
    );
  }, [user]);

  return (
    <div>
      <header>
        <button className="flex gap-2 text-xl m-2" onClick={() => window.history.back()}>
          <ArrowUturnLeftIcon className="size-6" />
          <p>Back</p>
        </button>
      </header>
      <div className="p-4">
        <div className="flex items-center gap-2">
          <Avatar username={user.username} />
          <h1 className="font-mono">{user.username}</h1>
        </div>
      </div>
      <section>
        <div>
          <h3 className="text-lg">Posts:</h3>
          {posts.map((post) => (
            <Post post={post} key={post.id}></Post>
          ))}
        </div>
        <div>
          <h3 className="text-lg">Liked Posts:</h3>
          {likedPosts.map((post) => (
            <Post post={post} key={post.id}></Post>
          ))}
        </div>
        <div>
          <h3 className="text-lg">Comments:</h3>
          {comments.map((comment) => (
            <Post post={comment} key={comment.id}></Post>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Profile;

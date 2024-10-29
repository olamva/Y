import Avatar from "@/components/Avatar";
import { PostType } from "@/lib/types";
import { ChatBubbleLeftIcon, HeartIcon } from "@heroicons/react/24/outline";
import { HeartFilledIcon } from "@radix-ui/react-icons";
import { MouseEvent, TouchEvent, useEffect, useState } from "react";

import { useMutation } from "@apollo/client";
import { LIKE_POST, UNLIKE_POST } from "@/queries/posts";

import { useAuth } from "./AuthContext";

const Post = ({ post }: { post: PostType }) => {
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(false);
  const [amtLikes, setAmtLikes] = useState(post.amtLikes);

  useEffect(() => {
    setIsLiked(user?.likedPostIds.includes(post.id) ?? false);
  }, [user?.likedPostIds, post.id]);

  const [likePost] = useMutation(LIKE_POST, {
    variables: { postID: post.id },
    onCompleted: (data) => {
      setAmtLikes(data.likePost.amtLikes);
      setIsLiked(true);
    },
  });

  const [unlikePost] = useMutation(UNLIKE_POST, {
    variables: { postID: post.id },
    onCompleted: (data) => {
      setAmtLikes(data.unlikePost.amtLikes);
      setIsLiked(false);
    },
  });

  const toggleLike = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    event.preventDefault();

    if (isLiked) {
      unlikePost();
    } else {
      likePost();
    }
  };

  return (
    <article
      className="m-2 w-full max-w-md cursor-pointer rounded-md border-2 border-white bg-zinc-50 p-3 text-black shadow-md dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
      onClick={(e: MouseEvent | TouchEvent) => {
        e.stopPropagation();
        document.location.href = `/project2/post/${post.id}`;
      }}
    >
      <header className="flex items-center gap-2">
        <Avatar username={post.author} />
        <p className="font-mono">{post.author}</p>
      </header>

      <p className="my-2">{post.body}</p>

      <footer className="flex w-full justify-around">
        <button className="flex items-center gap-1" onClick={toggleLike}>
          {isLiked ? (
            <HeartFilledIcon className="size-6 text-red-600 hover:scale-110" />
          ) : (
            <HeartIcon className="size-6 hover:scale-110" />
          )}
          <span>{amtLikes}</span>
        </button>
        <div className="flex items-center gap-1">
          <ChatBubbleLeftIcon className="size-6" />
          <span>{post.amtComments}</span>
        </div>
      </footer>
    </article>
  );
};

export default Post;

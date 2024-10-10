import { ChatBubbleLeftIcon, HeartIcon } from "@heroicons/react/24/outline";
import { PostType } from "@/lib/post.Interface";
import Avatar from "@/components/Avatar";
import { useState } from "react";
import { HeartFilledIcon } from "@radix-ui/react-icons";

const Post = ({ post }: { post: PostType }) => {
  const [isLiked, setIsLiked] = useState(false);

  return (
    <article className="m-2 w-full max-w-md rounded-md border-2 border-white bg-zinc-50 p-3 text-black shadow-md dark:border-zinc-700 dark:bg-zinc-900 dark:text-white">
      <header className="flex items-center gap-2">
        <Avatar username={post.author} />
        <p className="font-mono">{post.author}</p>
      </header>
      <p className="my-2">{post.body}</p>
      <footer className="flex w-full justify-around">
        <button
          className="flex items-center gap-1"
          onClick={() => setIsLiked(!isLiked)}
        >
          {isLiked ? (
            <HeartFilledIcon className="size-6 text-red-600 hover:scale-110" />
          ) : (
            <HeartIcon className="size-6 hover:scale-110" />
          )}
          <span>{isLiked ? post.amtLikes + 1 : post.amtLikes}</span>
        </button>
        <button className="flex items-center gap-1">
          <ChatBubbleLeftIcon className="size-6" />
          <span>{post.amtComments}</span>
        </button>
      </footer>
    </article>
  );
};

export default Post;

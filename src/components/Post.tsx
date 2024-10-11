import { ChatBubbleLeftIcon, HeartIcon } from "@heroicons/react/24/outline";
import { PostType } from "@/lib/types";
import Avatar from "@/components/Avatar";
import { useState, useEffect } from "react";
import { HeartFilledIcon } from "@radix-ui/react-icons";

const Post = ({ post }: { post: PostType }) => {
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    const likedPosts = JSON.parse(localStorage.getItem("likedPosts") || "[]");
    if (likedPosts.includes(post.id)) {
      setIsLiked(true);
    }
  }, [post.id]);

  const toggleLike = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    event.preventDefault();

    const likedPosts = JSON.parse(localStorage.getItem("likedPosts") || "[]");

    if (isLiked) {
      const updatedLikes = likedPosts.filter((id: string) => id !== post.id);
      localStorage.setItem("likedPosts", JSON.stringify(updatedLikes));
    } else {
      likedPosts.push(post.id);
      localStorage.setItem("likedPosts", JSON.stringify(likedPosts));
    }

    setIsLiked(!isLiked);
  };

  return (
    <a href={`/project2/post/${post.id}`} className="w-full max-w-md">
      <article className="m-2 w-full max-w-md rounded-md border-2 border-white bg-zinc-50 p-3 text-black shadow-md dark:border-zinc-700 dark:bg-zinc-900 dark:text-white">
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
            <span>{isLiked ? post.amtLikes + 1 : post.amtLikes}</span>
          </button>
          <div className="flex items-center gap-1">
            <ChatBubbleLeftIcon className="size-6" />
            <span>{post.amtComments}</span>
          </div>
        </footer>
      </article>
    </a>
  );
};

export default Post;

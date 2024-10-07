import { ChatBubbleLeftIcon, HeartIcon } from "@heroicons/react/24/outline";
import { PostType } from "../lib/post.Interface";
import Avatar from "./Avatar";

const Post = ({ post }: { post: PostType }) => (
  <article className="m-2 w-full max-w-md rounded-md bg-zinc-100 p-3 text-black dark:bg-zinc-900 dark:text-white">
    <header>
      <Avatar username={post.author} />
    </header>
    <p className="my-2">{post.body}</p>
    <footer className="flex w-full justify-around">
      <button className="flex items-center gap-1">
        <HeartIcon className="size-6" />
        <span>{post.amtLikes}</span>
      </button>
      <button className="flex items-center gap-1">
        <ChatBubbleLeftIcon className="size-6" />
        <span>{post.amtComments}</span>
      </button>
    </footer>
  </article>
);

export default Post;

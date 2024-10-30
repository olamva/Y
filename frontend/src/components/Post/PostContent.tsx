import { useAuth } from "@/components/AuthContext";
import Avatar from "@/components/Avatar";
import PostBody from "@/components/Post/PostBody";
import { CommentType, PostType } from "@/lib/types";
import { ApolloError } from "@apollo/client";
import { ChatBubbleLeftIcon } from "@heroicons/react/24/outline";
import { HeartFilledIcon } from "@radix-ui/react-icons";
import { HeartIcon, TrashIcon } from "lucide-react";
import { MouseEvent, TouchEvent } from "react";

interface PostContentProps {
  post: PostType | CommentType;
  toggleLike?: (e: MouseEvent<HTMLButtonElement>) => void;
  isLiked?: boolean;
  amtLikes?: number;
  doesntRedirect?: boolean;
  handleDelete: (e: MouseEvent<HTMLButtonElement>) => Promise<void>;
  deleteLoading: boolean;
  deleteError: ApolloError | undefined;
}
const PostContent = ({
  post,
  toggleLike,
  isLiked,
  amtLikes,
  doesntRedirect,
  handleDelete,
  deleteLoading,
  deleteError,
}: PostContentProps) => {
  const { user } = useAuth();
  const isComment = "parentID" in post;
  return (
    <article
      className={`my-2 w-full max-w-xl rounded-md border-2 p-3 text-black shadow-md dark:text-white ${doesntRedirect ? "cursor-text" : "cursor-pointer"} ${
        isComment
          ? "bg-gray-100 dark:border-gray-700 dark:bg-gray-900"
          : "border-white bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900"
      }`}
      onClick={(e: MouseEvent | TouchEvent) => {
        e.stopPropagation();
        if (!doesntRedirect) {
          document.location.href = `/project2/post/${post.id}`;
        }
      }}
    >
      <header className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Avatar username={post.author} />
          <a href={`/project2/user/${post.author}`}>
            <p className="font-mono underline-offset-4 hover:underline">
              <span className="font-sans">@</span>
              {post.author}
            </p>
          </a>
        </div>
        {user &&
          (user.username === post.author || user.username === "admin") && (
            <button
              onClick={handleDelete}
              className="text-gray-500 hover:text-red-500 focus:outline-none"
              aria-label="Delete post"
              disabled={deleteLoading}
            >
              <TrashIcon className="h-5 w-5" />
            </button>
          )}
      </header>

      <PostBody text={post.body} />

      {/* TODO: comment liking and replying  */}
      {!isComment && (
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
      )}

      {deleteError && (
        <p className="mt-2 text-sm text-red-500">
          Error deleting post: {deleteError.message}
        </p>
      )}
    </article>
  );
};

export default PostContent;
